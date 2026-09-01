import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello, World');
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is listening on the port: ${PORT}`);
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB connection failed');
    process.exit(1);
  }
};
