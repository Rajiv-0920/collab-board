import Activity from '../models/activity.model.js';
import { io } from '../../config/socket.js';

export const logActivity = async ({
  boardId,
  userId,
  action,
  entityType,
  entityId,
  meta = {},
}) => {
  try {
    const entry = await Activity.create({
      boardId,
      userId,
      action,
      entityType,
      entityId,
      meta,
    });
    const populated = await entry.populate('userId', 'name avatar');
    io.to(boardId).emit('activity:created', populated);
    return populated;
  } catch (error) {
    console.error('Failed to log activity:', error);
    throw error;
  }
};
