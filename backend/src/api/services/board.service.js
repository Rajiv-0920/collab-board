import mongoose from 'mongoose';
import Board from '../models/board.model.js';
import BoardMember from '../models/boardMember.model.js';
import List from '../models/list.model.js';
import Card from '../models/card.model.js';

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

export const getBoardByIdService = async (boardId) => {
  const board = await Board.findById(boardId);
  return board;
};

export const updateBoardService = async (boardId, data) => {
  const board = await Board.findByIdAndUpdate(boardId, data, {
    returnDocument: 'after',
  });
  return board;
};

export const deleteBoardService = async (boardId) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await Board.findByIdAndDelete(boardId, { session });
    await BoardMember.deleteMany({ boardId }, { session });
    await List.deleteMany({ boardId }, { session });
    await Card.deleteMany({ boardId }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
