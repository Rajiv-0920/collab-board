import Comment from '../models/comment.model.js';

export const getComments = async (cardId) => {
  const comments = await Comment.find({ cardId }).sort({ createdAt: -1 });
  return comments;
};

export const createComment = async ({ text, cardId, userId }) => {
  const result = await Comment.create({ text, cardId, userId });
  return result;
};
