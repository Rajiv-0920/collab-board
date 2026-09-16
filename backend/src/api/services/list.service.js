import List from '../models/list.model.js';

export const getListsService = async (boardId) => {
  const lists = await List.find({ boardId }).sort({ order: 1 });
  return lists;
};

export const createListService = async (title, boardId) => {
  const listCount = await List.countDocuments({ boardId });
  const list = await List.create({ title, boardId, order: listCount });
  return list;
};
