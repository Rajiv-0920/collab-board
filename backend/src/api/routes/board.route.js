import express from 'express';

import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createBoardSchema,
  updateBoardSchema,
} from '../schemas/board.schemas.js';
import {
  createBoard,
  getBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
} from '../controllers/board.controller.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import listRoutes from './list.route.js';

const router = express.Router();

router.get('/', protect, getBoard);

router.get('/:boardId', protect, requireRole('viewer'), getBoardById);

router.post('/', protect, validate(createBoardSchema), createBoard);

router.patch(
  '/:boardId',
  protect,
  validate(updateBoardSchema),
  requireRole('owner'),
  updateBoard,
);

router.delete('/:boardId', protect, requireRole('owner'), deleteBoard);

// Forward any requests matching /:boardId/lists to the list router
router.use('/:boardId/lists', listRoutes);

export default router;
