import mongoose from 'mongoose';

export const cardSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },

    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },

    title: { type: String, required: true, trim: true },

    description: { type: String, default: '' },

    dueDate: { type: Date, default: null },

    labels: { type: [String], default: [] },

    assigneeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    order: { type: Number, required: true, default: 0 },

    version: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Card = mongoose.model('Card', cardSchema);

export default Card;
