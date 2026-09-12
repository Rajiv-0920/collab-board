import express from 'express';

import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createBoardSchema } from '../schemas/board.schemas.js';
import { createBoard } from '../controllers/board.controller.js';

const router = express.Router();

router.post('/', protect, validate(createBoardSchema), createBoard);

export default router;
