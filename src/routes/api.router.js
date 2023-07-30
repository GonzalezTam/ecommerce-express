import { Router } from 'express';
import cartsRouter from './carts.router.js';
import productsRouter from './products.router.js';
import sessionRouter from './session.router.js';
import usersRouter from './users.router.js';
import chatRouter from './chat.router.js';
import ordersRouter from './orders.router.js';

const apiRouter = Router();

apiRouter.use('/products', productsRouter);
apiRouter.use('/carts', cartsRouter);
apiRouter.use('/session', sessionRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use('/orders', ordersRouter);

export default apiRouter;
