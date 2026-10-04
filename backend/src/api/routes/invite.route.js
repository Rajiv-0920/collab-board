import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as controller from '../controllers/invite.controller.js';

const router = express.Router();

router.get('/', protect, controller.getInvites);

router.post('/:inviteId/accept', protect, controller.acceptInvite);

router.post('/:inviteId/decline', protect, controller.declineInvite);

export default router;
