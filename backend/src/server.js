import express from 'express';
import 'dotenv/config';

import app from './app.js';
import connectDB from './config/database.js';

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello, World');
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is listening on the port: ${PORT}`);
});
