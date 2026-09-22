import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log(error);
    console.log('MongoDB connection failed');
    process.exit(1);
  }
};

export default connectDB;
