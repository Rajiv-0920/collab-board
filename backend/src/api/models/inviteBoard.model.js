import mongoose from 'mongoose';

const inviteBoardSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    inviteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      default: '',
      enum: ['editor', 'viewer'],
      required: true,
    },
    status: {
      type: String,
      default: '',
      enum: ['pending', 'accepted', 'declined', 'expired', 'revoked'],
      required: true,
    },
    expiresAt: { type: Date, default: null, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

inviteBoardSchema.index(
  { boardId: 1, inviteeId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  },
);

const InviteBoard = mongoose.model('InviteBoard', inviteBoardSchema);

export default InviteBoard;
