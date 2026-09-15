import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import * as controller from '../controllers/list.controller.js';
import { createListSchema } from '../schemas/list.schemas.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', protect, requireRole('viewer'), controller.getLists);

router.post(
  '/',
  protect,
  validate(createListSchema),
  requireRole('editor'),
  controller.createList,
);

export default router;
