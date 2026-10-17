import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['image', 'pdf'], required: true },
  fileName: { type: String, required: true },
  url: { type: String, required: true },
  extractedText: { type: String }
}, { _id: false });

const ChatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system', 'error'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Number, required: true },
  attachments: { type: [AttachmentSchema], default: [] }
}, { _id: false });

const MentorChatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true, default: 'New Conversation' },
  createdAt: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
  messages: { type: [ChatMessageSchema], default: [] },
  pinned: { type: Boolean, default: false },
  mode: { type: String, enum: ['mentor', 'interview', 'review', 'learning'], default: 'mentor' }
});

export const MentorChat = mongoose.models.MentorChat || mongoose.model('MentorChat', MentorChatSchema);
