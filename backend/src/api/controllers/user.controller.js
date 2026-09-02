import { sendResponse } from '../library/utils.js';

export const getMe = (req, res, next) => {
  try {
    return sendResponse(res, 200, true, 'User get successfully', req.user);
  } catch (error) {
    next(error);
  }
};
