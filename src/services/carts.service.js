import dotEnvConfig from '../config/env.config.js';
import cartModel from '../dao/models/cart.model.js';
import productModel from '../dao/models/product.model.js';

const { ENVIRONMENT } = dotEnvConfig;

const getAllCarts = async (req) => {
  try {
    const carts = await cartModel.find().lean().exec();
    return { status: 200, carts };
  } catch (error) {
    req.log.error(`[carts-getAllCarts] ${error.message}`);
    return { status: 500, error: error.message };
  }
};

const getCartById = async (req) => {
  const id = req.params.cid;
  try {
    const cart = await cartModel.findOne({ _id: id }).populate('products.productId').lean().exec();
    return { status: 200, cart };
  } catch (error) {
    req.log.error(`[carts-getCartById] ${error.message}`);
    return { status: 404, error: 'Cart not found' };
  }
};

const getCheckoutDetail = async (req) => {
  const id = req.params.cid;
  try {
    const cart = await cartModel.findOne({ _id: id }).populate('products.productId').lean().exec();
    const { products } = cart;
    const cartObj = {
      ...cart,
      products: products.map(p => {
        return {
          ...p.productId,
          quantity: p.quantity,
          subtotal: (p.productId.stock !== 0) && (p.quantity <= p.productId.stock) ? p.quantity * p.productId.price : 0,
          notEnoughStockWarning: (p.productId.stock !== 0 && p.quantity > p.productId.stock) ? `There are only ${p.productId.stock} units left` : false
        };
      }),
      outOfStockFlag: products.some(p => p.productId.stock === 0) || products.some(p => p.quantity > p.productId.stock)
    };

    const shippingPrice = 0; // hardcode shipping price
    const subTotal = cartObj?.products?.reduce((acc, curr) => acc + curr.subtotal, 0);
    const order = {
      user: req.user._id,
      shippingPrice: shippingPrice || 0,
      subTotal: subTotal || 0,
      total: subTotal + shippingPrice || 0
    };
    const userCartLength = products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

    const result = {
      cart: cartObj,
      order,
      userCartLength
    };

    return { status: 200, result };
  } catch (error) {
    req.log.error(`[carts-getCheckoutDetail] ${error.message}`);
    return { status: 500, error: error.message };
  }
};

const updateCartById = async (req) => {
  const id = req.params.cid;
  const { products } = req.body;
  if (!id) { return { status: 400, error: 'No Cart ID provided' }; }
  if (!products) { return { status: 400, error: 'No Products provided' }; }
  if (!Array.isArray(products)) { return { status: 400, error: 'Products must be an array' }; }
  try {
    const cartUpdated = await cartModel.updateOne({ _id: id }, { products }).lean().exec();
    req.log.info(`[carts-updateCartById] cart ${id} updated`);
    return { status: 200, cartUpdated };
  } catch (error) {
    req.log.error(`[carts-updateCartById] ${error.message}`);
    return { status: 404, error: 'Cart not found' };
  }
};

const deleteCartById = async (req) => {
  const id = req.params.cid;
  try {
    const cart = await cartModel.findOne({ _id: id }).lean().exec();
    await cartModel.deleteOne({ _id: id }).lean().exec();
    req.log.info(`[carts-deleteCartById] cart ${id} deleted`);
    return { status: 200, cart };
  } catch (error) {
    req.log.error(`[carts-deleteCartById] ${error.message}`);
    return { status: 404, error: 'Cart not found' };
  }
};

const createCart = async (req) => {
  const { products } = req.body;
  if (!products) return { status: 400, error: 'No Products provided' };
  if (!Array.isArray(products)) return { status: 400, error: 'Products must be an array' };
  try {
    const cart = await cartModel.create({ products });
    req.log.info(`[carts-createCart] cart ${cart._id} created`);
    return { status: 201, cartCreated: cart };
  } catch (error) {
    req.log.error(`[carts-createCart] ${error.message}`);
    return { status: 400, error: error.message };
  }
};

const addProductToCart = async (req) => {
  const user = req.user;
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = 0;

  if (!req.params.cid) return { status: 400, error: 'No Cart ID provided' };
  if (!req.params.pid) return { status: 400, error: 'No Product ID provided' };

  try {
    const product = await productModel.findOne({ _id: productId }).lean().exec();
    if ((ENVIRONMENT !== 'test') && user?.email === product?.owner) { return { status: 400, error: 'You cannot add your own product to your cart' }; }

    const cart = await cartModel.findOne({ _id: cartId }).lean().exec();
    const productInCart = Object.values(cart.products).some(product => product.productId === productId);
    if (!productInCart) {
      const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $push: { products: { productId, quantity: quantity + 1 } } }).lean().exec();
      req.log.info(`[carts-addProductToCart] product ${productId} added to cart ${cartId} successfully`);
      return { status: 200, updatedCart };
    } else {
      const updatedCart = await cartModel.updateOne({ _id: cartId, 'products.productId': productId }, { $inc: { 'products.$.quantity': 1 } }).lean().exec();
      req.log.info(`[carts-addProductToCart] product ${productId} quantity updated in cart ${cartId} successfully`);
      return { status: 200, updatedCart };
    }
  } catch (error) {
    req.log.error(`[carts-addProductToCart] ${error.message}`);
    return { status: 400, error: error.message };
  }
};

const updateProductQuantity = async (req) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = +req.body.quantity;

  if (!req.params.cid) return { status: 400, error: 'No Cart ID provided' };
  if (!req.params.pid) return { status: 400, error: 'No Product ID provided' };
  if (!req.body.quantity || isNaN(req.body.quantity)) return { status: 400, error: 'Quantity is not a number' };

  try {
    const cart = await cartModel.findOne({ _id: cartId }).lean().exec();
    const productInCart = Object.values(cart.products).some(product => product.productId === productId);
    if (!productInCart) {
      req.log.error(`[carts-updateProductQuantity] product ${productId} not in cart ${cartId}`);
      return { status: 404, error: 'Product not in cart' };
    } else {
      const updatedCart = await cartModel.updateOne({ _id: cartId, 'products.productId': productId }, { $set: { 'products.$.quantity': quantity } }).lean().exec();
      req.log.info(`[carts-updateProductQuantity] product ${productId} quantity updated in cart ${cartId} successfully`);
      return { status: 200, updatedCart };
    }
  } catch (error) {
    req.log.error(`[carts-updateProductQuantity] ${error.message}`);
    return { status: 400, error: error.message };
  }
};

const removeProductFromCart = async (req) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  try {
    const cart = await cartModel.findOne({ _id: cartId }).lean().exec();
    const productInCart = Object.values(cart.products).find(product => product.productId === productId);
    if (!productInCart) {
      req.log.error(`[carts-removeProductFromCart] product ${productId} not in cart ${cartId}`);
      return { status: 404, error: 'Product not in cart' };
    } else {
      if (productInCart.quantity === 1) { // if quantity is 1, remove product from cart
        const updatedCart = await cartModel.updateOne({ _id: cartId }, { $pull: { products: { productId } } }).lean().exec();
        req.log.info(`[carts-removeProductFromCart] product ${productId} removed from cart ${cartId} successfully`);
        return { status: 200, productRemoved: updatedCart };
      } else { // if quantity is greater than 1, decrement quantity
        const updatedCart = await cartModel.updateOne({ _id: cartId, 'products.productId': productId }, { $inc: { 'products.$.quantity': -1 } }).lean().exec();
        req.log.info(`[carts-removeProductFromCart] product ${productId} quantity updated in cart ${cartId} successfully`);
        return { status: 200, productRemoved: updatedCart };
      }
    }
  } catch (error) {
    req.log.error(`[carts-removeProductFromCart] ${error.message}`);
    return { status: 400, error: error.message };
  }
};

export const cartsService = {
  getAllCarts,
  getCartById,
  getCheckoutDetail,
  updateCartById,
  deleteCartById,
  createCart,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart
};
