import ticketModel from '../dao/models/ticket.model.js';
import { v4 as uuidv4 } from 'uuid';
import { emailSender } from '../utils/mailing/emailSender.js';

const getAllOrders = async (req) => {
  try {
    const orders = await ticketModel.find().lean().exec();
    return { status: 200, orders };
  } catch (error) {
    return { status: 500, error: error.message };
  }
};

const getOrderById = async (req) => {
  const id = req.params.id;
  try {
    const order = await ticketModel.findOne({ _id: id }).lean().exec();
    return { status: 200, order };
  } catch (error) {
    return { status: 404, error: 'Order not found' };
  }
};

const getOrderByTicketCode = async (req) => {
  const code = req.params.code;
  try {
    const order = await ticketModel.findOne({ code }).lean().exec();
    return { status: 200, order };
  } catch (error) {
    return { status: 404, error: 'Ticket not found' };
  }
};

const createOrder = async (req) => {
  const { user, body } = req;
  const { operations, toCharge } = body;
  const code = uuidv4();
  try {
    const ticket = await ticketModel.create({
      code,
      purchaser: user.email,
      amount: toCharge,
      items: operations.successfullyBought
    });

    const newOrder = {
      ticket: {
        code: ticket.code,
        amount: ticket.amount,
        purchaser: ticket.purchaser,
        created_at: ticket.purchase_datetime
      },
      operations
    };

    return { status: 201, result: newOrder };
  } catch (error) {
    return { status: 500, error: error.message };
  }
};

const emailOrder = async (req) => {
  const { user, body } = req;
  const { orderStatus, order } = body;
  const emailType = `order_${orderStatus}`;
  const emailData = { user, order };
  try {
    await emailSender(emailType, emailData);
    return { status: 201, result: 'Email sent' };
  } catch (error) {
    return { status: 500, error: error.message };
  }
};

export const ordersService = {
  getAllOrders,
  getOrderById,
  getOrderByTicketCode,
  createOrder,
  emailOrder
};
