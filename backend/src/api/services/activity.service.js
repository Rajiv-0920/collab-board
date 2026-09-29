import Activity from '../models/activity.model.js';

export const logActivity = async ({
  boardId,
  userId,
  action,
  entityType,
  entityId,
  meta = {},
}) => {
  try {
    await Activity.create({
      boardId,
      userId,
      action,
      entityType,
      entityId,
      meta,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    throw error;
  }
};
