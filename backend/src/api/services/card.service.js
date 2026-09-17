import Card from '../models/card.model.js';

export const getCardsService = async (listId) => {
  const cards = await Card.find({ listId }).sort({ order: 1 });
  return cards;
};

export const createCardService = async (title, listId) => {
  // Find the list with the highest order number
  const lastCard = await Card.findOne({ listId }).sort({ order: -1 });

  // If cards exist, add 1024 to the last order; otherwise start at 1024
  const newOrder = lastCard ? lastCard.order + 1024 : 1024;

  const card = await Card.create({ title, listId, order: newOrder });
  return card;
};

export const updateCardService = async (cardId, payload) => {
  const { prevOrder, nextOrder, ...data } = payload;

  if (prevOrder !== undefined || nextOrder !== undefined) {
    // 1. Explicitly coerce string inputs to numbers to prevent concatenation bugs
    const parsedPrevOrder =
      prevOrder !== null && prevOrder !== undefined ? Number(prevOrder) : null;
    const parsedNextOrder =
      nextOrder !== null && nextOrder !== undefined ? Number(nextOrder) : null;

    let newOrder;

    if (parsedPrevOrder === null && parsedNextOrder === null) {
      newOrder = 1024;
    } else if (parsedPrevOrder === null) {
      // Moved to the very top (before the first item)
      newOrder = parsedNextOrder / 2;
    } else if (parsedNextOrder === null) {
      // Moved to the very bottom (after the last item)
      newOrder = parsedPrevOrder + 1024;
    } else {
      // Moved between two items: calculate the midpoint
      newOrder = (parsedPrevOrder + parsedNextOrder) / 2;
    }

    data.order = newOrder;
  }

  const result = await Card.findByIdAndUpdate(cardId, data, {
    returnDocument: 'after',
  });

  // 3. Handle missing documents explicitly
  if (!result) {
    throw new Error('Card not found');
  }

  return result;
};

export const deleteCardService = async (cardId) => {
  await Card.findByIdAndDelete(cardId);
};
