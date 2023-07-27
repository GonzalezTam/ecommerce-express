import { Router } from 'express';
import productsController from '../controllers/products.controller.js';

const productsRouter = Router();

productsRouter.get('/', productsController.getAllProducts);
productsRouter.get('/manager/', productsController.getAllProductsManager);
productsRouter.get('/:id', productsController.getProductsById);
productsRouter.post('/', productsController.createProduct);
productsRouter.put('/:id', productsController.updateProduct);
productsRouter.put('/purchase/:cid', productsController.updateProductsStockByOrder);
productsRouter.delete('/:id', productsController.deleteProduct);

export default productsRouter;
