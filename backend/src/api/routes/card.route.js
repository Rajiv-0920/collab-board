import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as controller from '../controllers/card.controller.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCardSchema, updateCardSchema } from '../schemas/card.schemas.js';
import commentsRoute from './comment.route.js';
import {
  verifyListInBoard,
  verifyCardInBoard,
} from '../middlewares/verifyInBoard.middleware.js';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  protect,
  requireRole('viewer'),
  verifyListInBoard,
  controller.getCards,
);

router.post(
  '/',
  protect,
  requireRole('editor'),
  verifyListInBoard,
  validate(createCardSchema),
  controller.createCard,
);

router.patch(
  '/:cardId',
  protect,
  requireRole('editor'),
  verifyCardInBoard,
  validate(updateCardSchema),
  controller.updateCard,
);

router.delete(
  '/:cardId',
  protect,
  requireRole('editor'),
  verifyCardInBoard,
  controller.deleteCard,
);

router.use('/:cardId/comments', commentsRoute);

export default router;
