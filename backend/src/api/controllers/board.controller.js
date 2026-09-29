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
    const result = await boardService.getBoardDetailsService(
      req.params.boardId,
      req.user._id,
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
    const result = await boardService.getBoardActivityService(boardId);
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
    await boardService.deleteBoardService(req.params.boardId);
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
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'board:member:invited',
      entityType: 'member',
      entityId: invitedUser._id,
      meta: {
        invitedUserName: invitedUser.name,
        role: role,
      },
    });
    io.to(invitedUser._id.toString()).emit('board:member:invited', {
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
    const result = await boardService.updateBoardMemberService(
      boardId,
      userId,
      role,
    );
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'board:member:updated',
      entityType: 'member',
      entityId: result._id,
      meta: {
        targetUserName: result.name,
        oldRole: result.role === 'editor' ? 'viewer' : 'editor',
        newRole: result.role,
      },
    });
    io.to(boardId).emit('board:member:updated', result);
    return sendResponse(
      res,
      200,
      true,
      'Board member updated successfully',
      result,
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
