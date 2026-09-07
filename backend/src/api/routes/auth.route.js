import express from 'express';

import { login, register, logout } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schemas.js';
import { authLimiter } from '../library/authLimiter.js';

const router = express.Router();

router.post('/register', validate(registerSchema), authLimiter, register);

router.post('/login', validate(loginSchema), authLimiter, login);

router.post('/logout', logout);

export default router;
