import { cartsService } from '../services/carts.service.js';

const getAllCarts = async (req, res) => {
  const result = await cartsService.getAllCarts(req);
  res.status(result.status).send(result);
};

const getCartById = async (req, res) => {
  const result = await cartsService.getCartById(req);
  res.status(result.status).send(result);
};

const getCartDetailById = async (req, res) => {
  const result = await cartsService.getCheckoutDetail(req);
  res.status(result.status).send(result);
};

const updateCartById = async (req, res) => {
  const result = await cartsService.updateCartById(req);
  res.status(result.status).send(result);
};

const deleteCartById = async (req, res) => {
  const result = await cartsService.deleteCartById(req);
  res.status(result.status).send(result);
};

const createCart = async (req, res) => {
  const result = await cartsService.createCart(req);
  res.status(result.status).send(result);
};

const addProductToCart = async (req, res) => {
  const result = await cartsService.addProductToCart(req);
  res.status(result.status).send(result);
};

const updateProductQuantity = async (req, res) => {
  const result = await cartsService.updateProductQuantity(req);
  res.status(result.status).send(result);
};

const removeProductFromCart = async (req, res) => {
  const result = await cartsService.removeProductFromCart(req);
  res.status(result.status).send(result);
};

const cartsController = {
  getAllCarts,
  getCartById,
  getCartDetailById,
  updateCartById,
  deleteCartById,
  createCart,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart
};

export default cartsController;
