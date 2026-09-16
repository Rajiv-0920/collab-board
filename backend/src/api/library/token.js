import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateToken = (user) => {
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' },
  );
  return token;
};

export const setCookie = (res, token, rememberMe) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'Lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
};

export const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};
