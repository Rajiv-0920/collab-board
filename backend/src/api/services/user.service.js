import User from '../models/user.model.js';
import cloudinary from '../../config/cloudinary.js';

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
