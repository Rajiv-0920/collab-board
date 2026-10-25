import User from '../models/user.model.js';
import cloudinary from '../../config/cloudinary.js';
import { generateHashedPassword } from '../library/token.js';

export const updateProfileService = async (req, { name, avatarUrl }) => {
  const userId = req.user._id;
  const currentUser = req.user;

  const updateFields = {};
  if (name) updateFields.name = name;

  if (avatarUrl) {
    updateFields.avatarUrl = avatarUrl;

    if (
      currentUser.avatarUrl &&
      currentUser.avatarUrl.includes('cloudinary.com')
    ) {
      try {
        const urlParts = currentUser.avatarUrl.split('/');
        const folderAndFile = urlParts.slice(-2).join('/'); // gets "profiles/avatar_123_123456.jpg"
        const publicId = folderAndFile.substring(
          0,
          folderAndFile.lastIndexOf('.'),
        );

        const fullPublicId = `collab-board/${folderAndFile.substring(0, folderAndFile.lastIndexOf('.'))}`;

        await cloudinary.uploader.destroy(fullPublicId);
      } catch (cloudinaryError) {
        console.error(
          'Failed to delete old avatar from Cloudinary:',
          cloudinaryError,
        );
      }
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true },
  ).select('-password');

  return updatedUser;
};

export const updatePassword = async (req, { currentPassword, newPassword }) => {
  const userId = req.user._id;

  if (
    typeof currentPassword !== 'string' ||
    typeof newPassword !== 'string' ||
    !currentPassword ||
    !newPassword
  ) {
    const error = new Error('Current password and new password are required.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select('+passwordHash');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isPasswordMatch = await user.matchPassword(currentPassword);

  if (!isPasswordMatch) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 401;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters long.');
    error.statusCode = 400;
    throw error;
  }

  const isSamePassword = await user.matchPassword(newPassword);

  if (isSamePassword) {
    const error = new Error(
      'New password must be different from the current password.',
    );
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = await generateHashedPassword(newPassword);

  await user.save();

  return {
    message: 'Password changed successfully.',
  };
};
