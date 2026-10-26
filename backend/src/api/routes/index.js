import express from 'express';

import authRoutes from './auth.route.js';
import userRoutes from './user.route.js';
import boardRoutes from './board.route.js';
import inviteRoutes from './invite.route.js';
import { sendResponse } from '../library/utils.js';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/user', userRoutes);

router.use('/boards', boardRoutes);

router.use('/invites', inviteRoutes);

router.get('/health', (req, res) => {
  sendResponse(res, 200, true, 'OK');
});

export default router;
