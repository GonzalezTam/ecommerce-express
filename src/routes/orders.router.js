import { Router } from 'express';
import ordersController from '../controllers/orders.controller.js';

const ordersRouter = Router();

ordersRouter.get('/', ordersController.getAllOrders);
ordersRouter.get('/:id', ordersController.getOrderById);
ordersRouter.post('/', ordersController.createOrder);

export default ordersRouter;
