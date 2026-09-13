import express from 'express';

import authRoutes from './auth.route.js';
import userRoutes from './user.route.js';
import boardRoutes from './board.route.js';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/user', userRoutes);

router.use('/boards', boardRoutes);

export default router;
