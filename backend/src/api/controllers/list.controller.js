import { sendResponse } from '../library/utils.js';
import * as listService from '../services/list.service.js';
import { io } from '../../config/socket.js';
import { logActivity } from '../services/activity.service.js';

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
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'list:created',
      entityType: 'list',
      entityId: result._id,
      meta: {
        listTitle: result.title,
        listId: result._id,
      },
    });
    io.to(boardId).emit('list:created', result);
    return sendResponse(res, 201, true, 'List created successfully', result);
  } catch (error) {
    next(error);
  }
};

export const updateList = async (req, res, next) => {
  try {
    const { boardId, listId } = req.params;
    const result = await listService.updateListService(listId, req.body);
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'list:updated',
      entityType: 'list',
      entityId: result._id,
      meta: {
        oldListTitle: req.list.title,
        newListTitle: result.title,
      },
    });
    io.to(boardId).emit('list:updated', result);
    return sendResponse(res, 200, true, 'List updated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const deleteList = async (req, res, next) => {
  try {
    const { boardId, listId } = req.params;
    const result = await listService.deleteListService(listId);
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'list:deleted',
      entityType: 'list',
      entityId: result.list._id,
      meta: {
        listTitle: result.list.title,
        cardCount: result.cardCount,
      },
    });
    io.to(boardId).emit('list:deleted', listId);
    return sendResponse(res, 200, true, 'List deleted successfully');
  } catch (error) {
    next(error);
  }
};
