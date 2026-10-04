import * as boardService from '../services/board.service.js';
import { sendResponse } from '../library/utils.js';
import { io } from '../../config/socket.js';
import { logActivity } from '../services/activity.service.js';

export const getBoard = async (req, res, next) => {
  try {
    const result = await boardService.getBoardService(req);
    return sendResponse(res, 200, true, 'Board retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const createBoard = async (req, res, next) => {
  try {
    const result = await boardService.createBoardService(req, req.body);
    return sendResponse(res, 201, true, 'Board created successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getBoardById = async (req, res, next) => {
  try {
    const result = await boardService.getBoardByIdService(req.params.boardId);
    return sendResponse(res, 200, true, 'Board retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getBoardDetails = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const currentUserId = req.user._id;
    const result = await boardService.getBoardDetailsService(
      req,
      boardId,
      currentUserId,
    );
    return sendResponse(
      res,
      200,
      true,
      'Board details retrieved successfully',
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getBoardActivity = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const result = await boardService.getBoardActivityService({
      boardId,
      page,
      limit,
      status,
    });
    return sendResponse(
      res,
      200,
      true,
      'Board activity retrieved successfully',
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const updateBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const result = await boardService.updateBoardService(boardId, req.body);
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'board:updated',
      entityType: 'board',
      entityId: boardId,
      meta: {
        oldTitle: result.oldTitle,
        oldDescription: result.oldDescription,
        newTitle: result.board.title,
        newDescription: result.board.description,
      },
    });
    io.to(boardId).emit('board:updated', result.board);
    return sendResponse(
      res,
      200,
      true,
      'Board updated successfully',
      result,
      result.board,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    await boardService.deleteBoardService(boardId);
    io.to(boardId.toString()).emit('board:deleted', {
      boardId: boardId.toString(),
    });
    return sendResponse(res, 200, true, 'Board deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const inviteMemberToBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { email, role } = req.body;
    const invitedUser = await boardService.inviteMemberToBoardService(
      req,
      boardId,
      email,
      role,
    );
    /*
    console.log(invitedUser);
    {
      boardId: new ObjectId('6abfcaa19a0425d0182497df'),
      inviteeId: new ObjectId('6aaad34b82799b8ed0a04cad'),
      role: 'viewer',
      status: 'pending',
      expiresAt: 2026-10-10T15:33:11.014Z,
      _id: new ObjectId('6ac120375cb6c0943371586c'),
      createdAt: 2026-10-03T15:33:11.021Z,
      __v: 0
    }
    */
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'board:member:invited',
      entityType: 'member',
      entityId: invitedUser._id,
      meta: {
        invitedUserName: invitedUser.inviteeId.name,
        role: role,
      },
    });

    io.to(invitedUser.inviteeId._id.toString()).emit('board:member:invited', {
      email,
      role,
    });
    return sendResponse(res, 200, true, 'Member invited successfully');
  } catch (error) {
    next(error);
  }
};

export const updateBoardMember = async (req, res, next) => {
  try {
    const { boardId, userId } = req.params;
    const { role } = req.body;
    const { boardMember, user } = await boardService.updateBoardMemberService(
      boardId,
      userId,
      role,
    );
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'board:member:updated',
      entityType: 'member',
      entityId: boardMember._id,
      meta: {
        targetUserName: user.name,
        oldRole: boardMember.role === 'editor' ? 'viewer' : 'editor',
        newRole: boardMember.role,
      },
    });
    io.to(boardId).emit('board:member:updated', boardMember);
    return sendResponse(
      res,
      200,
      true,
      'Board member updated successfully',
      boardMember,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteBoardMember = async (req, res, next) => {
  try {
    const { boardId, userId } = req.params;
    const deletedMember = await boardService.deleteBoardMemberService(
      boardId,
      userId,
    );
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'board:member:deleted',
      entityType: 'member',
      entityId: deletedMember._id,
      meta: {
        deletedUserName: deletedMember.name,
      },
    });
    io.to(boardId).emit('board:member:deleted', userId);
    return sendResponse(res, 200, true, 'Board member deleted successfully');
  } catch (error) {
    next(error);
  }
};
