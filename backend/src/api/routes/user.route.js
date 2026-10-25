import express from 'express';

import { protect } from '../middlewares/auth.middleware.js';
import {
  getMe,
  updateProfile,
  updatePassword,
} from '../controllers/user.controller.js';
import { upload } from '../../config/cloudinary.js';

const router = express.Router();

router.get('/me', protect, getMe);

router.patch('/profile', protect, upload.single('avatarUrl'), updateProfile);

router.patch('/password', protect, updatePassword);

export default router;
