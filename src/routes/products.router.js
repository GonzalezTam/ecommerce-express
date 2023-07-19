import { Router } from 'express';
import productsController from '../controllers/products.controller.js';

const router = Router();

router.get('/', productsController.getAllProducts);
router.get('/manager/', productsController.getAllProductsManager);
router.get('/:id', productsController.getProductsById);
router.post('/', productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

export default router;
