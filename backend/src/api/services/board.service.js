import mongoose from 'mongoose';
import Board from '../models/board.model.js';
import BoardMember from '../models/boardMember.model.js';
import List from '../models/list.model.js';
import Card from '../models/card.model.js';
import User from '../models/user.model.js';
import Comment from '../models/comment.model.js';
import Activity from '../models/activity.model.js';
import InviteBoard from '../models/inviteBoard.model.js';
import {
  escapeRegex,
  BOARD_TYPES,
  ROLES,
  SORT_OPTIONS,
  parseDate,
} from '../library/boardHelpers.js';

export const getBoardService = async (req) => {
  const userId = req.user._id;

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 9),
  );

  const searchQuery = (req.query.search || req.query.q || '').trim();

  const boardType = BOARD_TYPES.includes(req.query.type)
    ? req.query.type
    : 'all';

  const role = ROLES.includes(req.query.role) ? req.query.role : null;

  const selectedSort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.updated;

  // Date range (optional): ?dateField=created&from=2026-10-01&to=2026-10-14
  const dateField =
    req.query.dateField === 'created' ? 'createdAt' : 'updatedAt';
  const fromDate = parseDate(req.query.from);
  const toDate = parseDate(req.query.to, true);

  // ---------- 2. Which boards does this user belong to? ----------
  // One query that also gives us the user's role on each board.
  const memberships = await BoardMember.find({ userId })
    .select('boardId role')
    .lean();

  const boardIds = memberships.map((m) => m.boardId);

  // boardId (string) -> role, so we can tell the frontend "your role here"
  const roleByBoard = new Map(
    memberships.map((m) => [m.boardId.toString(), m.role]),
  );

  // ---------- 3. Build the filter ----------
  // We collect conditions in an array and join them with $and.
  // Every condition must be true for a board to be returned.
  const conditions = [];

  // 3a. Role filter decides which boards we are even allowed to look at
  if (role === 'owner') {
    conditions.push({ ownerId: userId });
  } else if (role) {
    // editor / viewer: only boards where my membership has that role
    const idsWithRole = memberships
      .filter((m) => m.role === role)
      .map((m) => m.boardId);
    conditions.push({ _id: { $in: idsWithRole } });
  }

  // Always restrict to boards the user belongs to (security)
  conditions.push({ _id: { $in: boardIds } });

  // 3b. Board type: All / My Boards / Shared with Me
  if (boardType === 'mine') {
    conditions.push({ ownerId: userId });
  } else if (boardType === 'shared') {
    conditions.push({ ownerId: { $ne: userId } });
  }

  // 3c. Search by title or description (case-insensitive)
  if (searchQuery) {
    const regex = { $regex: escapeRegex(searchQuery), $options: 'i' };

    conditions.push({
      $or: [{ title: regex }, { description: regex }],
    });
  }

  // 3d. Date range
  if (fromDate || toDate) {
    const range = {};
    if (fromDate) range.$gte = fromDate;
    if (toDate) range.$lte = toDate;
    conditions.push({ [dateField]: range });
  }

  const boardQuery = { $and: conditions };

  // ---------- 4. Counts + pagination math ----------
  // totalBoards = boards matching ALL current filters (drives pagination)
  const totalBoards = await Board.countDocuments(boardQuery);

  const totalPages = Math.ceil(totalBoards / limit) || 1;
  const currentPage = Math.min(page, totalPages);
  const skip = (currentPage - 1) * limit;

  // ---------- 5. Dashboard stats (NOT affected by filters) ----------
  const [myBoards, totalLists, totalTasks, totalMembers, uniqueMemberIds] =
    await Promise.all([
      Board.countDocuments({ ownerId: userId, _id: { $in: boardIds } }),
      List.countDocuments({ boardId: { $in: boardIds } }),
      Card.countDocuments({ boardId: { $in: boardIds } }),
      BoardMember.countDocuments({ boardId: { $in: boardIds } }),
      BoardMember.distinct('userId', { boardId: { $in: boardIds } }),
    ]);

  const stats = {
    totalBoards: boardIds.length, // all boards I belong to (unfiltered)
    matchingBoards: totalBoards, // boards matching the current filters
    myBoards,
    sharedBoards: boardIds.length - myBoards,
    totalLists,
    totalTasks,
    totalMembers,
    totalUniqueMembers: uniqueMemberIds.length,
  };

  const pagination = {
    currentPage,
    limit,
    totalBoards, // matching the filters
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  // Echo back what was applied so the UI can show/clear filter chips
  const filters = {
    search: searchQuery,
    type: boardType,
    role,
    sort: SORT_OPTIONS[req.query.sort] ? req.query.sort : 'updated',
    dateField: dateField === 'createdAt' ? 'created' : 'updated',
    from: fromDate,
    to: toDate,
  };

  // ---------- 6. Fetch this page of boards ----------
  let query = Board.find(boardQuery)
    .sort(selectedSort)
    .skip(skip)
    .limit(limit)
    .populate('ownerId', 'name avatarUrl') // only safe fields, no email/password
    .lean();

  // Make A-Z sorting case-insensitive ("apple" and "Banana" sort correctly)
  if (req.query.sort === 'name_asc' || req.query.sort === 'name_desc') {
    query = query.collation({ locale: 'en', strength: 2 });
  }

  const boards = await query;

  const currentBoardIds = boards.map((board) => board._id);

  if (currentBoardIds.length === 0) {
    return {
      boards: [],
      stats,
      pagination: { ...pagination, hasNextPage: false },
      filters,
    };
  }

  // ---------- 7. Fetch children only for boards on this page ----------
  const [allBoardLists, allBoardTasks, allBoardMembers] = await Promise.all([
    List.find({ boardId: { $in: currentBoardIds } }).lean(),
    Card.find({ boardId: { $in: currentBoardIds } }).lean(),
    BoardMember.find({ boardId: { $in: currentBoardIds } })
      .populate({ path: 'userId', select: 'name avatarUrl' })
      .lean(),
  ]);

  // ---------- 8. Attach summary + my role to each board ----------
  const boardsWithSummary = boards.map((board) => {
    const boardId = board._id.toString();

    const boardMembers = allBoardMembers.filter(
      (member) => member.boardId.toString() === boardId,
    );
    const boardLists = allBoardLists.filter(
      (list) => list.boardId.toString() === boardId,
    );
    const boardTasks = allBoardTasks.filter(
      (task) => task.boardId.toString() === boardId,
    );

    const isOwner = board.ownerId?._id?.toString() === userId.toString();

    return {
      ...board,
      myRole: isOwner ? 'owner' : roleByBoard.get(boardId) || null,
      summary: {
        membersPreview: boardMembers.slice(0, 4),
        memberCount: boardMembers.length,
        taskCount: boardTasks.length,
        listCount: boardLists.length,
      },
    };
  });

  return { boards: boardsWithSummary, stats, pagination, filters };
};

export const getBoardDetailsService = async (req, boardId, currentUserId) => {
  const board = await Board.findById(boardId).lean();

  if (!board) {
    const error = new Error('Board not found');
    error.status = 404;
    throw error;
  }

  board.members = await BoardMember.find({
    boardId: boardId,
  })
    .populate('userId', 'name email avatarUrl')
    .lean();

  // Work out the current user's role
  const myRole = req.boardRole;

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
    isOwner: myRole === 'owner',
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
          members: [{ userId: req.user._id, role: 'owner' }],
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
    let cardIds = [];

    await session.withTransaction(async () => {
      const board = await Board.findById(boardId).session(session);

      if (!board) {
        const error = new Error('Board not found');
        error.status = 404;
        throw error;
      }

      const cards = await Card.find({
        boardId,
      })
        .select('_id')
        .session(session)
        .lean();

      cardIds = cards.map((card) => card._id);

      if (cardIds.length > 0) {
        await Comment.deleteMany(
          {
            cardId: { $in: cardIds },
          },
          { session },
        );
      }

      await Activity.deleteMany({ boardId }, { session });

      await Card.deleteMany({ boardId }, { session });

      await List.deleteMany({ boardId }, { session });

      await BoardMember.deleteMany({ boardId }, { session });

      await InviteBoard.deleteMany({ boardId }, { session });

      await Board.deleteOne({ _id: boardId }, { session });
    });
  } finally {
    await session.endSession();
  }
};

export const inviteMemberToBoardService = async (req, boardId, email, role) => {
  const board = await Board.findOne({
    _id: new mongoose.Types.ObjectId(boardId),
    ownerId: req.user._id,
  });
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
  const alreadyMember = await BoardMember.findOne({
    boardId,
    userId: user._id,
  });
  if (alreadyMember) {
    const error = new Error('User is already a member of this board');
    error.statusCode = 400;
    throw error;
  }
  const alreadyInvited = await InviteBoard.findOne({
    boardId,
    inviteeId: user._id,
    status: 'pending',
  });
  if (alreadyInvited) {
    const error = new Error('User is already invited to this board');
    error.statusCode = 400;
    throw error;
  }

  const invite = await InviteBoard.create({
    boardId,
    inviteeId: user._id,
    invitedBy: req.user._id,
    status: 'pending',
    role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  await invite.populate('inviteeId');
  return invite;
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
