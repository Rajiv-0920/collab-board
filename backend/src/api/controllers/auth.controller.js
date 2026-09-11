import * as authService from '../services/auth.service.js';
import { sendResponse } from '../library/utils.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendResponse(res, 201, true, 'User registered successfully', result);
  } catch (error) {
    next(error); // Pass to globalErrorHandler
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(res, req.body);

    return sendResponse(res, 200, true, 'User login successfully', result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req, res);
    return sendResponse(res, 200, true, 'User logged out successfully');
  } catch (error) {
    next(error);
  }
};
