import BoardMember from '../models/boardMember.model.js';

export const getUserRole = async (userId, boardId) => {
  const membership = await BoardMember.findOne({ userId, boardId });

  return membership ? membership.role : null;
};
