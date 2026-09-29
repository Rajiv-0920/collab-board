import List from '../models/list.model.js';
import Card from '../models/card.model.js';

export const verifyListInBoard = async (req, res, next) => {
  try {
    const { boardId, listId } = req.params;
    const list = await List.findOne({ _id: listId, boardId });
    if (!list) return res.status(404).json({ error: 'List not found' });
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyCardInBoard = async (req, res, next) => {
  try {
    const { boardId, listId, cardId } = req.params;
    const list = await List.findOne({ _id: listId, boardId });
    if (!list) return res.status(404).json({ error: 'List not found' });

    const card = await Card.findOne({ _id: cardId, listId });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    next();
  } catch (error) {
    next(error);
  }
};
