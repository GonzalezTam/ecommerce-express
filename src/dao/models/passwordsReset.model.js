import mongoose from 'mongoose';

const passwordsResetCollection = 'passwordsReset';
const passwordsResetSchema = new mongoose.Schema({
  email: { type: String, ref: 'users' },
  token: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expiresAfterSeconds: 3600 }
});

const passwordsResetModel = mongoose.model(passwordsResetCollection, passwordsResetSchema);

export default passwordsResetModel;
