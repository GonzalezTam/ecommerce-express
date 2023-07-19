import messageModel from '../dao/models/message.model.js';

const getMessages = async (req) => {
  try {
    // find last 20 and sort by date desc
    let messages = await messageModel.find().limit(20).sort({ date: -1 }).lean().exec();
    messages = messages.reverse();
    return { status: 200, messages };
  } catch (error) {
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
    return { status: 201, newMessage };
  } catch (error) {
    return { status: 500, error: error.message };
  }
};

export const chatService = {
  getMessages,
  postMessage
};
