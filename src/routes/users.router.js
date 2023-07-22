import { Router } from 'express';
import usersController from '../controllers/users.controller.js';

const usersRouter = Router();

usersRouter.put('/:id/cart/:cartId', usersController.updateUserCart);

export default usersRouter;
