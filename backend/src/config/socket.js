import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('+ A user connected: ', socket.id);

  socket.on('joinBoard', (boardId) => {
    socket.join(boardId);
    console.log(`+ User ${socket.id} joined board ${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log('- A user disconnected: ', socket.id);
  });
});

export { io, app, server };
