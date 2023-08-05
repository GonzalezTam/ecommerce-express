import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const userCollection = 'users';
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, max: 50, unique: true },
  password: { type: String, required: true, max: 50 },
  firstName: { type: String, required: true, max: 50 },
  lastName: { type: String, required: true, max: 50 },
  age: { type: Number, required: true, max: 100 },
  cart: { type: String, required: false, max: 100 },
  role: { type: String, required: true, max: 25, default: 'user' }
});

userSchema.plugin(mongoosePaginate);
const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
