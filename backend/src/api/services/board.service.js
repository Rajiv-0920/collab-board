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
  if (!boardMember) {
    const error = new Error('Board member not found');
    error.status = 404;
    throw error;
  }
  const board = await Board.find({
    _id: { $in: boardMember.map((m) => m.boardId) },
  });
  return board;
};

export const getBoardDetailsService = async (boardId, currentUserId) => {
  // 1. Fetch the board with member details
  const board = await Board.findById(boardId)
    .populate('members.user', 'name email avatarUrl')
    .lean();

  if (!board) {
    const error = new Error('Board not found');
    error.status = 404;
    throw error;
  }

  // 2. Work out the current user's role
  const isOwner = board.ownerId.toString() === currentUserId.toString();
  let myRole = 'viewer';

  if (isOwner) {
    myRole = 'owner';
  } else {
    const memberEntry = board.members.find(
      (m) => m.user._id.toString() === currentUserId.toString(),
    );
    if (memberEntry) myRole = memberEntry.role; // 'editor' or 'viewer'
  }

  // 3. Fetch all lists for the board
  const lists = await List.find({ boardId }).sort({ order: 1 }).lean();

  // 4. Fetch all cards for those lists in ONE query.
  //    assigneeIds is populated, so each card gets [{ _id, name, avatarUrl }]
  const cards = await Card.find({ listId: { $in: lists.map((l) => l._id) } })
    .sort({ order: 1 })
    .populate('assigneeIds', 'name avatarUrl')
    .lean();

  // 5. Fetch all comments for those cards in ONE query
  const comments = await Comment.find({
    cardId: { $in: cards.map((c) => c._id) },
  })
    .sort({ createdAt: 1 })
    .populate('userId', 'name avatarUrl')
    .lean();

  // 6. Group comments by card id
  const commentsByCard = new Map();
  for (const comment of comments) {
    const key = comment.cardId.toString();
    if (!commentsByCard.has(key)) commentsByCard.set(key, []);
    commentsByCard.get(key).push(comment);
  }

  // 7. Group cards (with their comments) by list id
  const cardsByList = new Map();
  for (const card of cards) {
    const cardWithComments = {
      ...card,
      comments: commentsByCard.get(card._id.toString()) || [],
    };
    const key = card.listId.toString();
    if (!cardsByList.has(key)) cardsByList.set(key, []);
    cardsByList.get(key).push(cardWithComments);
  }

  // 8. Attach cards to their lists
  const listsWithCards = lists.map((list) => ({
    ...list,
    cards: cardsByList.get(list._id.toString()) || [],
  }));

  // 9. Return everything
  return {
    ...board,
    lists: listsWithCards,
    myRole,
    isOwner,
    userId: currentUserId,
  };
};

export const createBoardService = async (req, { title, description }) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [board] = await Board.create(
      [
        {
          title,
          description,
          ownerId: req.user._id,
          members: [{ user: req.user._id, role: 'owner' }],
        },
      ],
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

export const getBoardActivityService = async ({
  boardId,
  status,
  page,
  limit,
}) => {
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
    await Activity.deleteMany({ boardId }, { session });

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
