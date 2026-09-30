import mongoose from 'mongoose';
import Board from '../models/board.model.js';
import BoardMember from '../models/boardMember.model.js';
import List from '../models/list.model.js';
import Card from '../models/card.model.js';
import User from '../models/user.model.js';
import Comment from '../models/comment.model.js';
import Activity from '../models/activity.model.js';

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

  // 3. Fetch lists and cards
  const lists = await List.find({ boardId }).sort({ order: 1 }).lean();

  const listsWithCards = await Promise.all(
    lists.map(async (list) => {
      const cards = await Card.find({ listId: list._id })
        .sort({ order: 1 })
        .lean();

      // 4. For each card, fetch its comments (and optionally populate the user who wrote it)
      const cardsWithComments = await Promise.all(
        cards.map(async (card) => {
          const comments = await Comment.find({ cardId: card._id })
            .sort({ createdAt: 1 }) // Oldest comments first, or -1 for newest first
            .populate('userId', 'name avatar') // Optional: populate user info if your comment schema has a user reference
            .lean();

          return {
            ...card,
            comments,
          };
        }),
      );

      return { ...list, cards: cardsWithComments };
    }),
  );

  // 5. Return everything, including the populated members and computed role
  return {
    ...board,
    lists: listsWithCards,
    myRole, // e.g., 'owner', 'editor', or 'viewer'
    isOwner, // Quick boolean check
    userId: currentUserId,
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

export const getBoardActivityService = async (queryCriteria) => {
  const { boardId, status, page = 1, limit = 10 } = queryCriteria;

  const filter = {};
  if (boardId) filter.boardId = boardId;
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  // Run queries in parallel for better performance
  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Activity.countDocuments(filter),
  ]);

  return {
    activities,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum * limitNum < total,
      hasPrevPage: pageNum > 1,
    },
  };
};

export const updateBoardService = async (boardId, data) => {
  const board = await Board.findByIdAndUpdate(boardId, data, {
    returnDocument: 'before',
    upsert: true,
  }).lean();
  const newBoard = { ...board, ...data };
  return {
    board: newBoard,
    oldTitle: board.title,
    oldDescription: board.description,
  };
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

export const inviteMemberToBoardService = async (req, boardId, email, role) => {
  const board = await Board.findById(boardId);
  const user = await User.findOne({ email });
  if (!board) {
    const error = new Error('Board not found');
    error.statusCode = 404;
    throw error;
  }
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  await BoardMember.create([{ boardId, userId: user._id, role }]);
  await Board.findByIdAndUpdate(boardId, {
    $push: { members: { user, role } },
  });
  return user;
};

export const updateBoardMemberService = async (boardId, userId, role) => {
  const boardMember = await BoardMember.findOneAndUpdate(
    { boardId, userId },
    { role },
    { returnDocument: 'after' },
  );
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  await Board.findOneAndUpdate(
    { _id: boardId, 'members.user': userId },
    { $set: { 'members.$.role': role } },
    { returnDocument: 'after' },
  );
  return { boardMember, user };
};

export const deleteBoardMemberService = async (boardId, userId) => {
  const boardMember = await BoardMember.findOneAndDelete({
    boardId,
    userId,
  }).populate('userId', 'name');
  await Board.findOneAndUpdate(
    { _id: boardId, 'members.user': userId },
    { $pull: { members: { user: userId } } },
    { returnDocument: 'after' },
  );
  return boardMember.userId;
};
