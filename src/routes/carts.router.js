import { Router } from 'express';
import cartsController from '../controllers/carts.controller.js';
import cartModel from '../dao/models/cart.model.js';
import productModel from '../dao/models/product.model.js';

const cartsRouter = Router();

cartsRouter.get('/', cartsController.getAllCarts);
cartsRouter.get('/:cid', cartsController.getCartById);
cartsRouter.get('/:cid/detail', cartsController.getCartDetailById);
cartsRouter.put('/:cid', cartsController.updateCartById);
cartsRouter.delete('/:cid', cartsController.deleteCartById);
cartsRouter.post('/', cartsController.createCart);

// Todo: create a controller for this
cartsRouter.post('/:cid/products/:pid', async (req, res) => {
  const user = req.session.user;
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = 0;
  if (!req.params.cid) {
    res.status(400).send({ error: 'No Cart ID provided' });
    return;
  }
  if (!req.params.pid) {
    res.status(400).send({ error: 'No Product ID provided' });
    return;
  }
  try {
    const product = await productModel.findOne({ _id: productId }).lean().exec();
    if (user.email === product.owner) { return res.status(400).send({ error: 'You cannot add your own product to your cart' }); }

    const cart = await cartModel.findOne({ _id: cartId }).lean().exec();
    const productInCart = Object.values(cart.products).some(product => product.productId === productId);

    if (!productInCart) {
      const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $push: { products: { productId, quantity: quantity + 1 } } }).lean().exec();
      req.log.info(`[carts-addProductToCart] product ${productId} added to cart ${cartId} successfully`);
      res.status(200).send({ updatedCart });
    } else {
      const updatedCart = await cartModel.updateOne({ _id: cartId, 'products.productId': productId }, { $inc: { 'products.$.quantity': 1 } }).lean().exec();
      req.log.info(`[carts-addProductToCart] product ${productId} quantity updated in cart ${cartId} successfully`);
      res.status(200).send({ updatedCart });
    }
  } catch (error) {
    req.log.error(`[carts-addProductToCart] ${error.message}`);
    res.status(400).send({ error: error.message });
  }
});

// Todo: create a controller for this
cartsRouter.put('/:cid/products/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = +req.body.quantity;

  if (!req.params.cid) {
    res.status(400).send({ error: 'No Cart ID provided' });
    return;
  }
  if (!req.params.pid) {
    res.status(400).send({ error: 'No Product ID provided' });
    return;
  }
  if (!req.body.quantity || isNaN(req.body.quantity)) {
    req.log.error(`[carts-updateProductQuantity] quantity ${req.body.quantity} is not a number`);
    res.status(400).send({ error: 'Quantity is not a number' });
    return;
  }
  try {
    const cart = await cartModel.findOne({ _id: cartId }).lean().exec();
    const productInCart = Object.values(cart.products).some(product => product.productId === productId);
    if (!productInCart) {
      req.log.error(`[carts-updateProductQuantity] product ${productId} not in cart ${cartId}`);
      res.status(404).send({ error: 'Product not in cart' });
    } else {
      const updatedCart = await cartModel.updateOne({ _id: cartId, 'products.productId': productId }, { $set: { 'products.$.quantity': quantity } }).lean().exec();
      req.log.info(`[carts-updateProductQuantity] product ${productId} quantity updated in cart ${cartId} successfully`);
      res.status(200).send({ updatedCart });
    }
  } catch (error) {
    req.log.error(`[carts-updateProductQuantity] ${error.message}`);
    res.status(400).send({ error: error.message });
  }
});

// Todo: create a controller for this
cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  try {
    const cart = await cartModel.findOne({ _id: cartId }).lean().exec();
    const productInCart = Object.values(cart.products).find(product => product.productId === productId);
    if (!productInCart) {
      req.log.error(`[carts-removeProductFromCart] product ${productId} not in cart ${cartId}`);
      res.status(404).send({ error: 'Product not in cart' });
    } else {
      if (productInCart.quantity === 1) { // if quantity is 1, remove product from cart
        const updatedCart = await cartModel.updateOne({ _id: cartId }, { $pull: { products: { productId } } }).lean().exec();
        req.log.info(`[carts-removeProductFromCart] product ${productId} removed from cart ${cartId} successfully`);
        res.status(200).send({ productRemoved: updatedCart });
      } else { // if quantity is greater than 1, decrement quantity
        const updatedCart = await cartModel.updateOne({ _id: cartId, 'products.productId': productId }, { $inc: { 'products.$.quantity': -1 } }).lean().exec();
        req.log.info(`[carts-removeProductFromCart] product ${productId} quantity updated in cart ${cartId} successfully`);
        res.status(200).send({ productRemoved: updatedCart });
      }
    }
  } catch (error) {
    req.log.error(`[carts-removeProductFromCart] ${error.message}`);
    res.status(400).send({ error: `Could not remove product ${productId} from cart ${cartId}` });
  }
});

export default cartsRouter;
