import mongoose from 'mongoose';

const VisitorLogSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    ip: {
      type: String,
      default: 'anonymous',
    },
    userAgent: {
      type: String,
      default: '',
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    referrer: {
      type: String,
      default: '',
    },
    userId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

VisitorLogSchema.index({ createdAt: -1 });

export default mongoose.models.VisitorLog || mongoose.model('VisitorLog', VisitorLogSchema);
