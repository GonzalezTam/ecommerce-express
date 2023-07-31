import messageModel from '../dao/models/message.model.js';

const getMessages = async (req) => {
  try {
    // find last 20 and sort by date desc
    let messages = await messageModel.find().limit(20).sort({ date: -1 }).lean().exec();
    messages = messages.reverse();
    return { status: 200, messages };
  } catch (error) {
    req.log.error('[chat-getMessages] could not get chat messages');
    return { status: 500, error: error.message };
  }
};

const postMessage = async (req) => {
  try {
    const message = {
      user: req.body.user,
      message: req.body.message,
      date: new Date()
    };
    const newMessage = await messageModel.create(message);
    req.log.info(`[chat-postMessage] ${message.user} posted a message`);
    return { status: 201, newMessage };
  } catch (error) {
    req.log.error('[chat-postMessage] error while saving message');
    return { status: 500, error: error.message };
  }
};

export const chatService = {
  getMessages,
  postMessage
};
