import { Router } from 'express';
import usersController from '../controllers/users.controller.js';
import configureMulter from '../middlewares/multer.js';

const usersRouter = Router();
const uploadDocuments = configureMulter('documents');

usersRouter.get('/', usersController.getAllUsers);
usersRouter.get('/manager/', usersController.getAllUsersManager);
usersRouter.put('/:id', usersController.updateUser);
usersRouter.put('/:id/cart/:cartId', usersController.updateUserCart);
usersRouter.get('/:id/documents', usersController.getUserDocuments);
usersRouter.post('/:id/documents', uploadDocuments.fields([
  { name: 'document_id', maxCount: 1 },
  { name: 'document_address', maxCount: 1 },
  { name: 'document_bank', maxCount: 1 }
]), usersController.uploadDocuments);
usersRouter.put('/premium/:id', usersController.updateUserPremium);
usersRouter.delete('/', usersController.deleteInactiveUsers);
usersRouter.delete('/:id', usersController.deleteUser);

export default usersRouter;
