import Comment from '../models/comment.model.js';

export const getComments = async (cardId) => {
  const comments = await Comment.find({ cardId }).sort({ createdAt: -1 });
  return comments;
};

export const createComment = async ({ text, cardId, userId }) => {
  const result = await Comment.create({ text, cardId, userId });
  return result;
};

export const deleteComment = async (req, commentId) => {
  const userId = req.user._id;
  const userRole = req.boardRole;

  const comment = await Comment.findById(commentId);

  if (userId.toString() === comment.userId.toString() || userRole === 'owner') {
    const result = await Comment.findByIdAndDelete(commentId);
    return result;
  }

  const error = new Error('You are not authorized to delete this comment');
  error.statusCode = 403;
  throw error;
};
