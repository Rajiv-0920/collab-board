import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'PasswordHash is required'],
      select: false,
    },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
