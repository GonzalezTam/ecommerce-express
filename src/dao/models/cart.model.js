import mongoose from 'mongoose';

const cartCollection = 'carts';
const cartSchema = new mongoose.Schema({
  products: {
    type: [
      {
        productId: { type: String, ref: 'products' },
        quantity: { type: Number, required: true }
      }
    ],
    required: true
  }
});

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;
