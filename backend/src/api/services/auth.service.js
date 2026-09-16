import User from '../models/user.model.js';
import {
  generateHashedPassword,
  generateToken,
  setCookie,
} from '../library/token.js';
import { is } from 'zod/v4/locales';

export const registerUser = async ({ name, email, password }) => {
  // 1. Check duplicate user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email.');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password
  const hashedPassword = await generateHashedPassword(password);

  // 3. Save to database
  const user = await User.create({
    name,
    email,
    passwordHash: hashedPassword,
  });

  // 4. Generate token
  const token = generateToken(user);

  // 5. Return sanitized user data
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

export const loginUser = async (res, { email, password, rememberMe }) => {
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    const error = new Error('Please enter valid credentials.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    const error = new Error('Please enter valid credentials.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);
  setCookie(res, token, rememberMe);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

export const logoutUser = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Instantly expires the cookie
  });

  return {
    message: 'User logged out successfully',
  };
};
