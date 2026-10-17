import mongoose from 'mongoose';

const LLDHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    diagramType: {
      type: String,
      required: true,
    },
    ast: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    elements: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    previewImage: {
      type: String,
      required: false,
    },
    chatHistory: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

LLDHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.LLDHistory || mongoose.model('LLDHistory', LLDHistorySchema);
