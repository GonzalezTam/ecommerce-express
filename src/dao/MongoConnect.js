import log from '../utils/logger/logger.js';
import mongoose from 'mongoose';

const mongoConnection = async (MONGO_URI, MONGO_DB) => {
  try {
    const URI = MONGO_URI + MONGO_DB;
    mongoose.set('strict', false);
    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 5000
    });
    log.info('Connected to database');
  } catch (error) {
    log.error('Error connecting to database: ', error);
  }
};

export default mongoConnection;
