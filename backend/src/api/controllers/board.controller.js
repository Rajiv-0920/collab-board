import * as boardService from '../services/board.service.js';
import { sendResponse } from '../library/utils.js';

export const createBoard = async (req, res, next) => {
  try {
    const result = await boardService.createBoardService(req, req.body);
    return sendResponse(res, 201, true, 'Board created successfully', result);
  } catch (error) {
    next(error);
  }
};
