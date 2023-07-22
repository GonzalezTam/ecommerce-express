import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ticketCollection = 'tickets';
const ticketCode = uuidv4();

const ticketSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, default: ticketCode },
  purchase_datetime: { type: Date, required: true },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true }
});

const ticketModel = mongoose.model(ticketCollection, ticketSchema);

export default ticketModel;
