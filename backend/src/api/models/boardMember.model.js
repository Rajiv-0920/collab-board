import mongoose from 'mongoose';

const boardMemberSchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer',
    },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

boardMemberSchema.index({ boardId: 1, userId: 1 }, { unique: true });

const BoardMember = mongoose.model('BoardMember', boardMemberSchema);

export default BoardMember;
