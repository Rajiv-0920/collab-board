import { sendResponse } from '../library/utils.js';
import * as listService from '../services/list.service.js';
import { io } from '../../config/socket.js';

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
    const { boardId } = req.params;
    const result = await listService.createListService(
      req.body.title,
      req.params.boardId,
    );
    io.to(boardId).emit('list:created', result);
    return sendResponse(res, 201, true, 'List created successfully', result);
  } catch (error) {
    next(error);
  }
};

export const updateList = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const result = await listService.updateListService(
      req.params.listId,
      req.body,
    );
    io.to(boardId).emit('list:updated', result);
    return sendResponse(res, 200, true, 'List updated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const deleteList = async (req, res, next) => {
  try {
    const { boardId, listId } = req.params;
    await listService.deleteListService(listId);
    io.to(boardId).emit('list:deleted', listId);
    return sendResponse(res, 200, true, 'List deleted successfully');
  } catch (error) {
    next(error);
  }
};
