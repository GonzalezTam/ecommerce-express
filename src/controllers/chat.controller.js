import { chatService } from '../services/chat.service.js';

const getMessages = async (req, res) => {
  const result = await chatService.getMessages(req);
  res.status(result.status).send(result);
};

const postMessage = async (req, res) => {
  const result = await chatService.postMessage(req);
  res.status(result.status).send(result);
};

const chatController = {
  getMessages,
  postMessage
};

export default chatController;
