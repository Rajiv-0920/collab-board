import express from 'express';
import 'dotenv/config';

import { server } from './config/socket.js';
import connectDB from './config/database.js';
import { setServers } from 'node:dns/promises';

import './app.js';

setServers(['1.1.1.1', '8.8.8.8']);

const PORT = 3000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Listening on :${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();
