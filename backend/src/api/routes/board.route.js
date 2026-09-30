import express from 'express';

import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createBoardSchema,
  updateBoardSchema,
  inviteMemberToBoardSchema,
} from '../schemas/board.schemas.js';
import {
  createBoard,
  getBoard,
  getBoardById,
  getBoardDetails,
  updateBoard,
  deleteBoard,
  inviteMemberToBoard,
  updateBoardMember,
  deleteBoardMember,
  getBoardActivity,
} from '../controllers/board.controller.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { updateBoardMemberSchema } from '../schemas/board.schemas.js';
import listRoutes from './list.route.js';

const router = express.Router();

router.get('/', protect, getBoard);

router.get('/:boardId', protect, requireRole('viewer'), getBoardById);

router.get(
  '/:boardId/details',
  protect,
  requireRole('viewer'),
  getBoardDetails,
);

router.get(
  '/:boardId/activity',
  protect,
  requireRole('viewer'),
  getBoardActivity,
);

router.post('/', protect, validate(createBoardSchema), createBoard);

router.post(
  '/:boardId/invite',
  protect,
  requireRole('owner'),
  validate(inviteMemberToBoardSchema),
  inviteMemberToBoard,
);

router.patch(
  '/:boardId',
  protect,
  requireRole('owner'),
  validate(updateBoardSchema),
  updateBoard,
);

router.patch(
  '/:boardId/members/:userId',
  protect,
  requireRole('owner'),
  validate(updateBoardMemberSchema),
  updateBoardMember,
);

router.delete('/:boardId', protect, requireRole('owner'), deleteBoard);

router.delete(
  '/:boardId/members/:userId',
  protect,
  requireRole('owner'),
  deleteBoardMember,
);

// Forward any requests matching /:boardId/lists to the list router
router.use('/:boardId/lists', listRoutes);

export default router;
