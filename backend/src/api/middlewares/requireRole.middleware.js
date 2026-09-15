import { getUserRole } from '../services/boardMember.service.js';
import mongoose from 'mongoose';

const ROLE_RANK = { viewer: 1, editor: 2, owner: 3 };

export const requireRole = (minimumRole) => {
  return async function (req, res, next) {
    const userId = req.user._id || req.user.id;
    const boardId = new mongoose.Types.ObjectId(req.params.boardId);

    const role = await getUserRole(userId, boardId);

    if (!role)
      return res.status(403).json({ error: 'Not a member of this board' });
    if (ROLE_RANK[role] < ROLE_RANK[minimumRole]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.boardRole = role;
    next();
  };
};
