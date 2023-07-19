import mongoose from 'mongoose';

const connectDB = async (MONGO_URI) => {
  try {
    mongoose.set('strict', false);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to database');
  } catch (error) {
    // console.log(error)
    console.log('Cannot connect to database');
  }
};

export default connectDB;
