import * as boardService from '../services/board.service.js';
import { sendResponse } from '../library/utils.js';

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

export const updateBoard = async (req, res, next) => {
  try {
    const result = await boardService.updateBoardService(
      req.params.boardId,
      req.body,
    );
    return sendResponse(res, 200, true, 'Board updated successfully', result);
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
