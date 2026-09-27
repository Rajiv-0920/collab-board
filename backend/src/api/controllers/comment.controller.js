import * as commentService from '../services/comment.service.js';
import { sendResponse } from '../library/utils.js';

export const getComments = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const comments = await commentService.getComments(cardId);
    return sendResponse(
      res,
      200,
      true,
      'Comments retrieved successfully',
      comments,
    );
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { cardId } = req.params;
    const userId = req.user._id;

    const result = await commentService.createComment({ text, cardId, userId });
    return sendResponse(res, 201, true, 'Comment created successfully', result);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const result = await commentService.deleteComment(req, commentId);
    return sendResponse(res, 200, true, 'Comment deleted successfully', result);
  } catch (error) {
    next(error);
  }
};
