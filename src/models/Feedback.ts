import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2000,
    },
    userEmail: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
