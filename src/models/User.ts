import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: false, // Optional because OAuth users (Google/Github) won't have a password
      minlength: 6,
      select: false,
    },
    image: {
      type: String, // To store profile pictures from Google/GitHub
    },
    emailVerified: {
      type: Date, // For NextAuth compatibility
    },
    resetPasswordOtp: {
      type: String, // SHA-256 hash of the OTP, never the OTP itself
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    resetPasswordAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    customLimits: {
      lldReview: { type: Number, default: null },
      lldChat: { type: Number, default: null },
      hldReview: { type: Number, default: null },
      hldChat: { type: Number, default: null },
      aiGenerator: { type: Number, default: null },
      mentorChat: { type: Number, default: null },
    },
    aiUsage: {
      lldReview: { type: Number, default: 0 },
      lldChat: { type: Number, default: 0 },
      hldReview: { type: Number, default: 0 },
      hldChat: { type: Number, default: 0 },
      aiGenerator: { type: Number, default: 0 },
      mentorChat: { type: Number, default: 0 },
      totalCalls: { type: Number, default: 0 },
      lastUsedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
