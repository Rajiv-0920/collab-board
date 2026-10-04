import Card from '../models/card.model.js';
import List from '../models/list.model.js';
import Comment from '../models/comment.model.js';

export const getCardsService = async (listId, boardId) => {
  const cards = await Card.find({ listId, boardId }).sort({ order: 1 });
  return cards;
};

export const createCardService = async (
  { title, description, dueDate, labels, assigneeIds },
  listId,
  boardId,
) => {
  const lastCard = await Card.findOne({ listId, boardId }).sort({ order: -1 });

  // If cards exist, add 1024 to the last order; otherwise start at 1024
  const newOrder = lastCard ? lastCard.order + 1024 : 1024;

  const card = await Card.create({
    title,
    description,
    dueDate,
    labels: [...new Set(labels.map((l) => l.trim()).filter(Boolean))],
    assigneeIds,
    listId,
    order: newOrder,
    boardId,
  });

  await card.populate('assigneeIds', 'name avatarUrl');
  return card;
};

export const updateCardService = async ({
  cardId,
  title,
  description,
  dueDate,
  labels,
  assigneeIds,
  prevOrder,
  nextOrder,
  version: clientVersion,
  listId,
}) => {
  const data = {
    title,
    description,
    dueDate,
    labels: [...new Set(labels.map((l) => l.trim()).filter(Boolean))],
    assigneeIds,
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

  const currentCard = await Card.findById(cardId);
  if (!currentCard) {
    const error = new Error('Card not found');
    error.status = 404;
    throw error;
  }
  if (listId) {
    if (String(currentCard.listId) !== String(listId)) {
      const [currentList, targetList] = await Promise.all([
        List.findById(currentCard.listId),
        List.findById(listId),
      ]);

      if (!currentList) {
        const error = new Error('Current list not found');
        error.status = 404;
        throw error;
      }
      if (!targetList) {
        const error = new Error('Target list not found');
        error.status = 404;
        throw error;
      }
      if (String(targetList.boardId) !== String(currentList.boardId)) {
        const error = new Error(
          'Cannot move card to a list on a different board',
        );
        error.status = 400;
        throw error;
      }

      data.listId = listId;
    }
  }

  // --- Apply update ---
  const result = await Card.findOneAndUpdate(
    {
      _id: cardId,
      version: clientVersion,
    },
    {
      $set: data,
      $inc: {
        version: 1,
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  )
    .populate('listId', 'title')
    .populate('assigneeIds', 'name avatarUrl');

  if (!result) {
    const error = new Error(
      'Card was modified by another user. Please refresh and try again.',
    );

    error.statusCode = 409;
    throw error;
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
