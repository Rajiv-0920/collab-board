import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['editor', 'viewer'],
          default: 'viewer',
        },
      },
    ],
  },
  { timestamps: true },
);

const Board = mongoose.model('Board', boardSchema);

export default Board;
