import { sendResponse } from '../library/utils.js';
import * as userService from '../services/user.service.js';

export const getMe = (req, res, next) => {
  try {
    return sendResponse(res, 200, true, 'User get successfully', req.user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const avatarUrl = req.file?.path;
    const result = await userService.updateProfileService(req, {
      name,
      avatarUrl,
    });
    return sendResponse(res, 200, true, 'Profile updated successfully', result);
  } catch (error) {
    next(error);
  }
};
