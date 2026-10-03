import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import BoardMember from '../api/models/boardMember.model.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const token = cookieHeader ? cookieHeader.split('=')[1] : null;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.userId;

    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('+ User connected:', socket.id);
  console.log('+ Authenticated user:', socket.userId);
  console.log('Transport:', socket.conn.transport.name);
  // Personal room
  socket.join(socket.userId);

  socket.on('joinBoard', async (boardId, callback) => {
    try {
      const member = await BoardMember.findOne({
        boardId,
        userId: socket.userId,
      });

      if (!member) {
        return callback?.({
          success: false,
          message: 'You do not have access to this board',
        });
      }

      socket.join(boardId);

      console.log(`+ User ${socket.userId} joined board ${boardId}`);

      callback?.({
        success: true,
        role: member.role,
      });
    } catch (error) {
      console.error('joinBoard error:', error);

      callback?.({
        success: false,
        message: 'Unable to join board',
      });
    }
  });

  socket.on('leaveBoard', (boardId) => {
    socket.leave(boardId);

    console.log(`- User ${socket.userId} left board ${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log('- User disconnected:', socket.id, socket.userId);
  });
});

export { io, app, server };
