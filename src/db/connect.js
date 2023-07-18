import mongoose from 'mongoose';

const connectDB = async (MONGO_URI) => {
  try {
    mongoose.set('strict', false);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('DB Connected');
  } catch (error) {
    // console.log(error)
    console.log('DB Connection Error');
  }
};

export default connectDB;
