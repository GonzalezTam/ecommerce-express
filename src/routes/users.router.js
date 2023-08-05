import { Router } from 'express';
import usersController from '../controllers/users.controller.js';

const usersRouter = Router();

usersRouter.get('/', usersController.getAllUsers);
usersRouter.get('/manager/', usersController.getAllUsersManager);
usersRouter.put('/:id', usersController.updateUser);
usersRouter.put('/:id/cart/:cartId', usersController.updateUserCart);
usersRouter.delete('/:id', usersController.deleteUser);
usersRouter.delete('/inactives', usersController.deleteInactiveUsers);

export default usersRouter;
