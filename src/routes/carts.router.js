import { Router } from 'express';
import cartsController from '../controllers/carts.controller.js';

const cartsRouter = Router();

cartsRouter.get('/', cartsController.getAllCarts);
cartsRouter.post('/', cartsController.createCart);
cartsRouter.get('/:cid', cartsController.getCartById);
cartsRouter.put('/:cid', cartsController.updateCartById);
cartsRouter.delete('/:cid', cartsController.deleteCartById);
cartsRouter.get('/:cid/detail', cartsController.getCartDetailById);
cartsRouter.post('/:cid/products/:pid', cartsController.addProductToCart);
cartsRouter.put('/:cid/products/:pid', cartsController.updateProductQuantity);
cartsRouter.delete('/:cid/products/:pid', cartsController.removeProductFromCart);

export default cartsRouter;
