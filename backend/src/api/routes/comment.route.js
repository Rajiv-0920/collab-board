import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import * as controller from '../controllers/comment.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCommentSchema } from '../schemas/comment.schemas.js';
import { verifyCardInBoard } from '../middlewares/verifyInBoard.middleware.js';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  protect,
  requireRole('viewer'),
  verifyCardInBoard,
  controller.getComments,
);

router.post(
  '/',
  protect,
  requireRole('viewer'),
  verifyCardInBoard,
  validate(createCommentSchema),
  controller.createComment,
);

router.delete(
  '/:commentId',
  protect,
  requireRole('viewer'),
  verifyCardInBoard,
  controller.deleteComment,
);

export default router;
