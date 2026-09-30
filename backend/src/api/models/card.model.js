import mongoose from 'mongoose';

export const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Card = mongoose.model('Card', cardSchema);

export default Card;
