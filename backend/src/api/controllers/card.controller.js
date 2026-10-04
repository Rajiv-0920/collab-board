import * as cardService from '../services/card.service.js';
import { sendResponse } from '../library/utils.js';
import { io } from '../../config/socket.js';
import { logActivity } from '../services/activity.service.js';
import { Types } from 'mongoose';

export const getCards = async (req, res, next) => {
  try {
    const { boardId, listId } = req.params;
    const cards = await cardService.getCardsService(listId, boardId);
    return sendResponse(res, 200, true, 'Cards retrieved successfully', cards);
  } catch (error) {
    next(error);
  }
};

export const createCard = async (req, res, next) => {
  try {
    const { boardId, listId } = req.params;
    const { title, description, dueDate, labels, assigneeIds } = req.body;

    const result = await cardService.createCardService(
      { title, description, dueDate, labels, assigneeIds },
      listId,
      boardId,
    );

    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'card:created',
      listId,
      entityId: result._id,
      entityType: 'card',
      meta: { cardTitle: result.title, listId, listTitle: req.list.title },
    });

    io.to(boardId).emit('card:created', result);
    return sendResponse(res, 201, true, 'Card created successfully', result);
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const { boardId, cardId } = req.params;
    const {
      title,
      description,
      dueDate,
      labels,
      assigneeIds,
      prevOrder,
      nextOrder,
      version,
      listId,
    } = req.body;
    const result = await cardService.updateCardService({
      title,
      description,
      dueDate,
      labels,
      assigneeIds,
      prevOrder,
      nextOrder,
      version,
      listId,
      cardId,
    });
    let isMoved = false;
    if (listId && listId !== result.listId) {
      await logActivity({
        boardId,
        userId: req.user._id,
        action: 'card:moved',
        entityType: 'card',
        entityId: result._id,
        meta: {
          cardTitle: result.title,
          fromListId: new Types.ObjectId(req.list._id),
          fromListTitle: req.list.title,
          toListTitle: result.listId.title,
          toListId: new Types.ObjectId(result.listId._id),
        },
      });
      isMoved = true;
    }

    io.to(boardId).emit('card:updated', { result, isMoved });
    return sendResponse(res, 200, true, 'Card updated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const { boardId, cardId } = req.params;
    const result = await cardService.deleteCardService(cardId);
    await logActivity({
      boardId,
      userId: req.user._id,
      action: 'card:deleted',
      entityType: 'card',
      entityId: cardId,
      meta: {
        cardTitle: result.title,
        listTitle: result.listId.title,
      },
    });
    io.to(boardId).emit('card:deleted', cardId);
    sendResponse(res, 200, true, 'Card deleted successfully');
  } catch (error) {
    next(error);
  }
};
