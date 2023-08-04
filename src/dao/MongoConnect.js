import log from '../utils/logger/logger.js';
import mongoose from 'mongoose';

const mongoConnection = async (MONGO_URI) => {
  try {
    mongoose.set('strict', false);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    log.info('Connected to database');
  } catch (error) {
    log.error('Error connecting to database: ', error);
  }
};

export default mongoConnection;
