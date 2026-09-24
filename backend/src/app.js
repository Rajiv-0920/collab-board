import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import apiRoutes from './api/routes/index.js';
import { globalErrorHandler } from './api/middlewares/errorHandler.middleware.js';
import { app } from './config/socket.js';

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use('/api', apiRoutes);

app.use(globalErrorHandler);

export default app;
