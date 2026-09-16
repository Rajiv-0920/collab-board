import * as cardService from '../services/card.service.js';
import { sendResponse } from '../library/utils.js';

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
    const result = await cardService.createCardService(
      req.body.title,
      req.params.listId,
    );
    return sendResponse(res, 201, true, 'Card created successfully', result);
  } catch (error) {
    next(error);
  }
};
