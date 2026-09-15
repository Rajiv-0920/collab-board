import mongoose from 'mongoose';
import Board from '../models/board.model.js';
import BoardMember from '../models/boardMember.model.js';

export const getBoardService = async (req) => {
  const boardMember = await BoardMember.find({ userId: req.user._id });
  if (!boardMember) throw new Error('Board member not found');
  const board = await Board.find({
    _id: { $in: boardMember.map((m) => m.boardId) },
  });
  return board;
};

export const createBoardService = async (req, { title, description }) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [board] = await Board.create(
      [{ title, description, ownerId: req.user._id }],
      { session },
    );

    await BoardMember.create(
      [{ boardId: board._id, userId: req.user._id, role: 'owner' }],
      { session },
    );

    await session.commitTransaction();
    return board;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
