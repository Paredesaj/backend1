import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: String,
  code: String,
  price: Number,
  stock: Number,
  category: String,
  thumbnails: [String],
  status: { type: Boolean, default: true },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
