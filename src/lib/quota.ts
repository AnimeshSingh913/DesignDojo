import dbConnect from '@/lib/db';
import User from '@/models/User';
import SystemSetting, { DEFAULT_AI_LIMITS, IAILimits } from '@/models/SystemSetting';
import { getAuthUser, AuthUserInfo } from '@/lib/auth-check';

export type AIFeatureKey = 'lldReview' | 'lldChat' | 'hldReview' | 'hldChat' | 'aiGenerator' | 'mentorChat';

// LLD code generation counts against `lldChat`, Terraform generation against `hldChat`.
export const FEATURE_NAMES: Record<AIFeatureKey, string> = {
  lldReview: 'LLD Design Review',
  lldChat: 'LLD Assistant (chat & code gen)',
  hldReview: 'HLD Design Review',
  hldChat: 'HLD Assistant (chat & Terraform)',
  aiGenerator: 'AI Architecture Generator',
  mentorChat: 'AI Mentor Chat',
};

export async function getGlobalLimits(): Promise<IAILimits> {
  await dbConnect();
  const setting = await SystemSetting.findOne({ key: 'global_ai_limits' });
  if (setting && setting.limits) {
    return {
      lldReview: setting.limits.lldReview ?? DEFAULT_AI_LIMITS.lldReview,
      lldChat: setting.limits.lldChat ?? DEFAULT_AI_LIMITS.lldChat,
      hldReview: setting.limits.hldReview ?? DEFAULT_AI_LIMITS.hldReview,
      hldChat: setting.limits.hldChat ?? DEFAULT_AI_LIMITS.hldChat,
      aiGenerator: setting.limits.aiGenerator ?? DEFAULT_AI_LIMITS.aiGenerator,
      mentorChat: setting.limits.mentorChat ?? DEFAULT_AI_LIMITS.mentorChat,
    };
  }
  return { ...DEFAULT_AI_LIMITS };
}

export interface QuotaCheckResult {
  success: boolean;
  status?: number;
  message?: string;
  current?: number;
  max?: number;
  remaining?: number;
  isAdmin?: boolean;
  user?: AuthUserInfo;
}

export async function checkAndIncrementQuota(
  req: Request,
  feature: AIFeatureKey
): Promise<QuotaCheckResult> {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return {
      success: false,
      status: 401,
      message: 'Unauthorized. Please sign in to use this AI feature.',
    };
  }

  await dbConnect();
  const dbUser = await User.findById(authUser.id).select('role customLimits aiUsage');
  if (!dbUser) {
    return {
      success: false,
      status: 404,
      message: 'User account not found.',
    };
  }

  const usageField = `aiUsage.${feature}`;
  const increment = {
    $inc: { [usageField]: 1, 'aiUsage.totalCalls': 1 },
    $set: { 'aiUsage.lastUsedAt': new Date() },
  };

  // Admin users have unlimited access (usage is still recorded)
  if (dbUser.role === 'admin') {
    const updated = await User.findByIdAndUpdate(dbUser._id, increment, { new: true }).select('aiUsage');
    return {
      success: true,
      isAdmin: true,
      current: updated?.aiUsage?.[feature] ?? 0,
      max: 9999,
      remaining: 9999,
      user: authUser,
    };
  }

  // Retrieve global limits and user custom limit overrides
  const globalLimits = await getGlobalLimits();
  const customLimit = dbUser.customLimits?.[feature];
  const maxLimit = typeof customLimit === 'number' && customLimit >= 0
    ? customLimit
    : globalLimits[feature];

  // Atomic check-and-increment: concurrent requests can't push usage past the limit
  const updated = await User.findOneAndUpdate(
    {
      _id: dbUser._id,
      $or: [{ [usageField]: { $lt: maxLimit } }, { [usageField]: { $exists: false } }, { [usageField]: null }],
    },
    increment,
    { new: true }
  ).select('aiUsage');

  if (!updated) {
    const currentUsage = dbUser.aiUsage?.[feature] || 0;
    return {
      success: false,
      status: 403,
      message: `Usage limit exceeded for ${FEATURE_NAMES[feature]} (${currentUsage}/${maxLimit} used). You can ask the Admin to increase your limit!`,
      current: currentUsage,
      max: maxLimit,
      remaining: 0,
      user: authUser,
    };
  }

  const newUsage = updated.aiUsage?.[feature] ?? 0;
  return {
    success: true,
    current: newUsage,
    max: maxLimit,
    remaining: Math.max(0, maxLimit - newUsage),
    user: authUser,
  };
}

export async function getUserQuotaSummary(userId: string) {
  await dbConnect();
  const dbUser = await User.findById(userId);
  if (!dbUser) return null;

  const globalLimits = await getGlobalLimits();
  const features: AIFeatureKey[] = ['lldReview', 'lldChat', 'hldReview', 'hldChat', 'aiGenerator', 'mentorChat'];

  const summary: Record<string, { used: number; max: number; remaining: number; name: string }> = {};

  for (const feature of features) {
    const customLimit = dbUser.customLimits?.[feature];
    const maxLimit = typeof customLimit === 'number' && customLimit >= 0
      ? customLimit
      : globalLimits[feature];
    const used = dbUser.aiUsage?.[feature] || 0;

    summary[feature] = {
      name: FEATURE_NAMES[feature],
      used,
      max: dbUser.role === 'admin' ? 9999 : maxLimit,
      remaining: dbUser.role === 'admin' ? 9999 : Math.max(0, maxLimit - used),
    };
  }

  return {
    role: dbUser.role || 'user',
    totalCalls: dbUser.aiUsage?.totalCalls || 0,
    features: summary,
  };
}
