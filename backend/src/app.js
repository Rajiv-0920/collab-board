import express from 'express';
import cookieParser from 'cookie-parser';

import apiRoutes from './api/routes/index.js';
import { globalErrorHandler } from './api/middlewares/errorHandler.middleware.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api', apiRoutes);

app.use(globalErrorHandler);

export default app;
