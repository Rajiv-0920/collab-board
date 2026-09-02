import express from 'express';

import apiRoutes from './api/routes/index.js';
import { globalErrorHandler } from './api/middlewares/errorHandler.middleware.js';

const app = express();

app.use(express.json());

app.use('/api', apiRoutes);

app.use(globalErrorHandler);

export default app;
