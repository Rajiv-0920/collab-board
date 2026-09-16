import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as controller from '../controllers/card.controller.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCardSchema } from '../schemas/card.schemas.js';

const router = express.Router({ mergeParams: true });

router.get('/', protect, requireRole('viewer'), controller.getCards);

router.post(
  '/',
  protect,
  requireRole('editor'),
  validate(createCardSchema),
  controller.createCard,
);

export default router;
