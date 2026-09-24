import * as cardService from '../services/card.service.js';
import { sendResponse } from '../library/utils.js';
import { io } from '../../config/socket.js';

export const getCards = async (req, res, next) => {
  try {
    const cards = await cardService.getCardsService(req.params.listId);
    return sendResponse(res, 200, true, 'Cards retrieved successfully', cards);
  } catch (error) {
    next(error);
  }
};

export const createCard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const result = await cardService.createCardService(
      req.body.title,
      req.params.listId,
    );
    io.to(boardId).emit('card:created', result);
    return sendResponse(res, 201, true, 'Card created successfully', result);
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const result = await cardService.updateCardService(
      req.params.cardId,
      req.body,
    );
    io.to(boardId).emit('card:updated', result);
    return sendResponse(res, 200, true, 'Card updated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    await cardService.deleteCardService(req.params.cardId);
    io.to(boardId).emit('card:deleted');
    sendResponse(res, 200, true, 'Card deleted successfully');
  } catch (error) {
    next(error);
  }
};
