import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const userCollection = 'users';
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, max: 50, unique: true },
  password: { type: String, required: true, max: 50 },
  firstName: { type: String, required: true, max: 50 },
  lastName: { type: String, required: true, max: 50 },
  age: { type: Number, required: true, max: 100 },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'carts' },
  role: { type: String, enum: ['user', 'premium', 'admin'], required: true, default: 'user' },
  documents: {
    type: [
      {
        fieldname: { type: String, required: true },
        name: { type: String, required: true },
        reference: { type: String, required: true }
      }
    ],
    required: true
  },
  last_connection: { type: Date, default: null }
}, { timestamps: true });

userSchema.plugin(mongoosePaginate);
const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
