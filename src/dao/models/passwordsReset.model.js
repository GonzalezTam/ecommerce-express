import mongoose from 'mongoose';

const passwordsResetCollection = 'passwordsReset';
const passwordsResetSchema = new mongoose.Schema({
  email: { type: String, ref: 'users' },
  token: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
// add index to expire documents after 1 hour
passwordsResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const passwordsResetModel = mongoose.model(passwordsResetCollection, passwordsResetSchema);

export default passwordsResetModel;
