import Card from '../models/card.model.js';

export const getCardsService = async (listId) => {
  const cards = await Card.find({ listId }).sort({ order: 1 });
  return cards;
};

export const createCardService = async (title, listId) => {
  const listCount = await Card.countDocuments({ listId });
  const result = await Card.create({ title, listId, order: listCount });
  return result;
};
