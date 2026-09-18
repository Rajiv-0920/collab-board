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

export const getBoardDetailsService = async (boardId, currentUserId) => {
  // 1. Fetch board and populate member user details (name, email, avatar)
  const board = await Board.findById(boardId)
    .populate('members.user', 'name email avatar')
    .lean();

  if (!board) {
    throw new Error('Board not found');
  }

  // 2. Determine the current user's role for this board
  const isOwner = board.ownerId.toString() === currentUserId.toString();

  let myRole = 'viewer'; // Default fallback
  if (isOwner) {
    myRole = 'owner';
  } else {
    // Find the user in the members array
    const memberEntry = board.members.find(
      (m) => m.user._id.toString() === currentUserId.toString(),
    );
    if (memberEntry) {
      myRole = memberEntry.role; // Will be 'editor' or 'viewer'
    }
  }

  // 3. Fetch lists and cards as before
  const lists = await List.find({ boardId }).sort({ order: 1 }).lean();

  const listsWithCards = await Promise.all(
    lists.map(async (list) => {
      const cards = await Card.find({ listId: list._id })
        .sort({ order: 1 })
        .lean();
      return { ...list, cards };
    }),
  );

  // 4. Return everything, including the populated members and computed role
  return {
    ...board,
    lists: listsWithCards,
    myRole, // e.g., 'owner', 'editor', or 'viewer'
    isOwner, // Quick boolean check
  };
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
