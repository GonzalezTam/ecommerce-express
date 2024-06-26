import ticketModel from '../dao/models/ticket.model.js';
import { v4 as uuidv4 } from 'uuid';
import { emailSender } from '../utils/mailing/emailSender.js';

const getAllOrders = async (req) => {
  try {
    const orders = await ticketModel.find().lean().exec();
    return { status: 200, orders };
  } catch (error) {
    req.log.error(`[orders-getAllOrders] ${error.message}`);
    return { status: 500, error: error.message };
  }
};

const getOrderById = async (req) => {
  const id = req.params.id;
  try {
    const order = await ticketModel.findOne({ _id: id }).lean().exec();
    return { status: 200, order };
  } catch (error) {
    req.log.error(`[orders-getOrderById] ${error.message}`);
    return { status: 404, error: 'Order not found' };
  }
};

const getOrderByTicketCode = async (req) => {
  const code = req.params.code;
  try {
    const order = await ticketModel.findOne({ code }).lean().exec();
    return { status: 200, order };
  } catch (error) {
    req.log.error(`[orders-getOrderByTicketCode] ${error.message}`);
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

    req.log.info(`[orders-createOrder] order ${code} created successfully`);
    return { status: 201, result: newOrder };
  } catch (error) {
    req.log.error(`[orders-createOrder] ${error.message}`);
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
    req.log.info('[orders-emailOrder] email sent successfully');
    return { status: 201, result: 'Email sent' };
  } catch (error) {
    req.log.error(`[orders-emailOrder] ${error.message}`);
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
