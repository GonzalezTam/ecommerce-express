import { Router } from 'express';
import cartsRouter from './carts.router.js';
import productsRouter from './products.router.js';
import sessionRouter from './session.router.js';

const apiRouter = Router();

apiRouter.use('/products', productsRouter);
apiRouter.use('/carts', cartsRouter);
apiRouter.use('/session', sessionRouter);

export default apiRouter;
