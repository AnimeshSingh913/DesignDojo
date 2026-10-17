import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SystemSetting, { DEFAULT_AI_LIMITS } from '@/models/SystemSetting';
import { requireAdmin } from '@/lib/auth-check';
import { errorResponse } from '@/lib/http';

/** Parses a non-negative integer limit; falls back to the default only when the input is not a number. */
function toLimit(value: unknown, fallback: number): number {
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? Math.min(Math.max(0, n), 100000) : fallback;
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    await dbConnect();
    const setting = await SystemSetting.findOne({ key: 'global_ai_limits' });
    return NextResponse.json({
      limits: setting?.limits || DEFAULT_AI_LIMITS,
      defaultLimits: DEFAULT_AI_LIMITS,
      updatedAt: setting?.updatedAt || null,
      updatedBy: setting?.updatedBy || 'system',
    }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 'Server error');
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { limits } = await req.json();

    if (!limits || typeof limits !== 'object') {
      return NextResponse.json({ message: 'Invalid limits object' }, { status: 400 });
    }

    // Validate limit numbers (must be >= 0)
    const validLimits = {
      lldReview: toLimit(limits.lldReview, DEFAULT_AI_LIMITS.lldReview),
      lldChat: toLimit(limits.lldChat, DEFAULT_AI_LIMITS.lldChat),
      hldReview: toLimit(limits.hldReview, DEFAULT_AI_LIMITS.hldReview),
      hldChat: toLimit(limits.hldChat, DEFAULT_AI_LIMITS.hldChat),
      aiGenerator: toLimit(limits.aiGenerator, DEFAULT_AI_LIMITS.aiGenerator),
      mentorChat: toLimit(limits.mentorChat, DEFAULT_AI_LIMITS.mentorChat),
    };

    await dbConnect();

    const updatedSetting = await SystemSetting.findOneAndUpdate(
      { key: 'global_ai_limits' },
      {
        limits: validLimits,
        updatedBy: admin.email,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: 'Global AI limits updated successfully',
      limits: updatedSetting.limits,
    }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 'Server error');
  }
}
