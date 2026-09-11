import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const error = new Error('Not authorized, no token');
      error.statusCode = 401;
      throw error;
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decode.userId);

    if (!user) {
      const error = new Error('User not found or no longer exists');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
