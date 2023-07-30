import { Router } from 'express';
import chatController from '../controllers/chat.controller.js';

const chatRouter = Router();

chatRouter.get('/', chatController.getMessages);
chatRouter.post('/', chatController.postMessage);

export default chatRouter;
