import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import * as controller from '../controllers/list.controller.js';
import { createListSchema, updateListSchema } from '../schemas/list.schemas.js';
import { validate } from '../middlewares/validate.middleware.js';
import { verifyListInBoard } from '../middlewares/verifyInBoard.middleware.js';
import cardRouter from './card.route.js';

const router = express.Router({ mergeParams: true });

router.get('/', protect, requireRole('viewer'), controller.getLists);

router.post(
  '/',
  protect,
  requireRole('editor'),
  validate(createListSchema),
  controller.createList,
);

router.patch(
  '/:listId',
  protect,
  requireRole('editor'),
  verifyListInBoard,
  validate(updateListSchema),
  controller.updateList,
);

router.delete(
  '/:listId',
  protect,
  requireRole('editor'),
  verifyListInBoard,
  controller.deleteList,
);

router.use('/:listId/cards', cardRouter);

export default router;
