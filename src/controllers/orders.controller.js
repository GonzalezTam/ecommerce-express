import { cartsService } from '../services/carts.service.js';
import { ordersService } from '../services/orders.service.js';

const getAllOrders = async (req, res) => {
  const result = await ordersService.getAllOrders(req);
  return res.status(result.status).send(result);
};

const getOrderById = async (req, res) => {
  const result = await ordersService.getOrderById(req);
  return res.status(result.status).send(result);
};

const createOrder = async (req, res) => {
  const result = await ordersService.createOrder(req);
  const { operations } = result.result;
  const { notEnoughRequested } = operations;
  const productsRemainingInCart = notEnoughRequested.map(p => {
    return {
      productId: p.id,
      quantity: p.quantityRequested
    };
  });
  // Update cart and leave only the products that were not enough in stock.
  if (result.status === 201) {
    req.body.products = productsRemainingInCart;
    req.params.cid = req.user.cart;
    await cartsService.updateCartById(req);
  }
  return res.status(result.status).send(result);
};

const ordersController = {
  getAllOrders,
  getOrderById,
  createOrder
};

export default ordersController;
