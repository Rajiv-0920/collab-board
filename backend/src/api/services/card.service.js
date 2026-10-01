import Card from '../models/card.model.js';
import List from '../models/list.model.js';
import Comment from '../models/comment.model.js';

export const getCardsService = async (listId, boardId) => {
  const cards = await Card.find({ listId, boardId }).sort({ order: 1 });
  return cards;
};

export const createCardService = async (title, listId, boardId) => {
  const lastCard = await Card.findOne({ listId, boardId }).sort({ order: -1 });

  // If cards exist, add 1024 to the last order; otherwise start at 1024
  const newOrder = lastCard ? lastCard.order + 1024 : 1024;

  const card = await Card.create({ title, listId, order: newOrder, boardId });
  return card;
};

export const updateCardService = async ({
  cardId,
  title,
  prevOrder,
  nextOrder,
  listId,
}) => {
  const data = {
    title,
    listId,
  };
  if (prevOrder !== undefined || nextOrder !== undefined) {
    const parsedPrevOrder =
      prevOrder !== null && prevOrder !== undefined ? Number(prevOrder) : null;
    const parsedNextOrder =
      nextOrder !== null && nextOrder !== undefined ? Number(nextOrder) : null;

    let newOrder;

    if (parsedPrevOrder === null && parsedNextOrder === null) {
      newOrder = 1024;
    } else if (parsedPrevOrder === null) {
      newOrder = parsedNextOrder / 2;
    } else if (parsedNextOrder === null) {
      newOrder = parsedPrevOrder + 1024;
    } else {
      newOrder = (parsedPrevOrder + parsedNextOrder) / 2;
    }

    data.order = newOrder;
  }

  if (listId) {
    const currentCard = await Card.findById(cardId);
    if (!currentCard) {
      throw new Error('Card not found');
    }

    if (String(currentCard.listId) !== String(listId)) {
      const [currentList, targetList] = await Promise.all([
        List.findById(currentCard.listId),
        List.findById(listId),
      ]);

      if (!currentList) {
        throw new Error('Current list not found');
      }
      if (!targetList) {
        throw new Error('Target list not found');
      }
      if (String(targetList.boardId) !== String(currentList.boardId)) {
        throw new Error('Cannot move card to a list on a different board');
      }

      data.listId = listId;
    }
  }

  // --- Apply update ---
  const result = await Card.findByIdAndUpdate(cardId, data, {
    returnDocument: 'after',
  }).populate('listId', 'title');

  if (!result) {
    throw new Error('Card not found');
  }

  const comments = await Comment.find({ cardId }).populate(
    'userId',
    'name avatar',
  );

  return { ...result.toObject(), comments };
};

export const deleteCardService = async (cardId) => {
  return await Card.findByIdAndDelete(cardId).populate('listId', 'title');
};
