import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productCollection = 'products';
const productSchema = new mongoose.Schema({
  owner: { type: String, required: true, ref: 'users', default: 'admin' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  code: { type: String, required: true, unique: true },
  status: { type: Boolean, required: true },
  category: { type: String, required: true },
  thumbnails: { type: Array, required: true }
});

productSchema.plugin(mongoosePaginate);
const productModel = mongoose.model(productCollection, productSchema);

export default productModel;
