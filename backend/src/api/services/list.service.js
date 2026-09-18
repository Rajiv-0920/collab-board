import List from '../models/list.model.js';
import Card from '../models/card.model.js';

export const getListsService = async (boardId) => {
  const lists = await List.find({ boardId })
    .sort({ order: 1 })
    .populate('boardId');
  return lists;
};

export const createListService = async (title, boardId) => {
  // Find the list with the highest order number
  const lastList = await List.findOne({ boardId }).sort({ order: -1 });

  // If lists exist, add 1024 to the last order; otherwise start at 1024
  const newOrder = lastList ? lastList.order + 1024 : 1024;

  const list = await List.create({ title, boardId, order: newOrder });
  return list;
};

export const updateListService = async (
  listId,
  { prevOrder, nextOrder, ...data },
) => {
  // If the frontend sent neighboring orders for a drag-and-drop move, calculate the midpoint
  if (prevOrder !== undefined || nextOrder !== undefined) {
    let newOrder;

    if (prevOrder === null && nextOrder === null) {
      newOrder = 1024;
    } else if (prevOrder === null || prevOrder === undefined) {
      // Moved to the very top (before the first item)
      newOrder = nextOrder / 2;
    } else if (nextOrder === null || nextOrder === undefined) {
      // Moved to the very bottom (after the last item)
      newOrder = prevOrder + 1024;
    } else {
      // Moved between two items: calculate the midpoint
      newOrder = (prevOrder + nextOrder) / 2;
    }

    data.order = newOrder;
  }

  const list = await List.findByIdAndUpdate(listId, data, {
    returnDocument: 'after',
  });
  return list;
};

export const deleteListService = async (listId) => {
  await List.findByIdAndDelete(listId);
  await Card.deleteMany({ listId });
};
