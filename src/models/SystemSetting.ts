import mongoose from 'mongoose';

export interface IAILimits {
  lldReview: number;
  lldChat: number;
  hldReview: number;
  hldChat: number;
  aiGenerator: number;
  mentorChat: number;
}

export const DEFAULT_AI_LIMITS: IAILimits = {
  lldReview: 3,
  lldChat: 5,
  hldReview: 3,
  hldChat: 5,
  aiGenerator: 5,
  mentorChat: 10,
};

const SystemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global_ai_limits',
    },
    limits: {
      lldReview: { type: Number, default: DEFAULT_AI_LIMITS.lldReview },
      lldChat: { type: Number, default: DEFAULT_AI_LIMITS.lldChat },
      hldReview: { type: Number, default: DEFAULT_AI_LIMITS.hldReview },
      hldChat: { type: Number, default: DEFAULT_AI_LIMITS.hldChat },
      aiGenerator: { type: Number, default: DEFAULT_AI_LIMITS.aiGenerator },
      mentorChat: { type: Number, default: DEFAULT_AI_LIMITS.mentorChat },
    },
    updatedBy: {
      type: String,
      default: 'system',
    },
  },
  { timestamps: true }
);

export default mongoose.models.SystemSetting || mongoose.model('SystemSetting', SystemSettingSchema);
