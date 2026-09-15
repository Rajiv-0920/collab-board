import { sendResponse } from '../library/utils.js';
import * as listService from '../services/list.service.js';

export const getLists = async (req, res, next) => {
  try {
    const lists = await listService.getListsService(req.params.boardId);
    return sendResponse(res, 200, true, 'Lists retrieved successfully', lists);
  } catch (error) {
    next(error);
  }
};

export const createList = async (req, res, next) => {
  try {
    const result = await listService.createListService(
      req.body.title,
      req.params.boardId,
    );
    return sendResponse(res, 201, true, 'List created successfully', result);
  } catch (error) {
    next(error);
  }
};
