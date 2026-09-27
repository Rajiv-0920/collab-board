import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import * as controller from '../controllers/comment.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/', protect, requireRole('viewer'), controller.getComments);

router.post('/', protect, requireRole('viewer'), controller.createComment);

router.delete(
  '/:commentId',
  protect,
  requireRole('viewer'),
  controller.deleteComment,
);

export default router;
