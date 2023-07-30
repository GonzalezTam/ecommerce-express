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

const getOrderByTicketCode = async (req, res) => {
  const result = await ordersService.getOrderByTicketCode(req);
  return res.status(result.status).send(result);
};

const createOrder = async (req, res) => {
  try {
    const result = await ordersService.createOrder(req);
    const { operations } = result.result;
    const { notEnoughRequested } = operations;
    const productsRemainingInCart = notEnoughRequested.map(p => {
      return {
        productId: p.id,
        quantity: p.quantityRequested
      };
    });

    // result.status === 201 means that the order was created.
    if (result.status === 201) {
      // Send an email advising that the order was created.
      req.body.orderStatus = 'success';
      req.body.order = result.result;
      await ordersService.emailOrder(req);
      // Update cart and leave only the products that were not enough in stock.
      req.body.products = productsRemainingInCart;
      req.params.cid = req.user.cart;
      await cartsService.updateCartById(req);
    } else {
      // Send an email advising that the order was not created.
      req.body.orderStatus = 'failed';
      await ordersService.emailOrder(req);
    }
    return res.status(result.status).send(result);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const ordersController = {
  getAllOrders,
  getOrderById,
  getOrderByTicketCode,
  createOrder
};

export default ordersController;
