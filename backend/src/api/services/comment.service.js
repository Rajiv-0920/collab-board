import Comment from '../models/comment.model.js';

export const getComments = async (cardId) => {
  const comments = await Comment.find({ cardId })
    .sort({ createdAt: -1 })
    .populate('userId');
  return comments;
};

export const createComment = async ({ text, cardId, userId }) => {
  const comment = await Comment.create({ text, cardId, userId });
  await comment.populate('userId', 'name');
  return comment;
};

export const deleteComment = async (req, commentId) => {
  const userId = req.user._id;
  const { boardId, cardId } = req.params;
  const userRole = req.boardRole;

  const comment = await Comment.findOne({ _id: commentId, cardId }).populate(
    'userId',
  );
  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  const isAuthor = comment.userId._id.toString() === userId.toString();
  if (!isAuthor && userRole !== 'owner') {
    const error = new Error('You are not authorized to delete this comment');
    error.statusCode = 403;
    throw error;
  }

  await comment.deleteOne();
  return comment;
};
