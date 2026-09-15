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
    console.log(req.params.boardId);
    const result = await boardService.getBoardByIdService(req.params.boardId);
    return sendResponse(res, 200, true, 'Board retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
