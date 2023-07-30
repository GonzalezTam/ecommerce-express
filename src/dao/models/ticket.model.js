import mongoose from 'mongoose';

const ticketCollection = 'tickets';

const ticketSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, required: true, default: Date.now() },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
  items: { type: Array, required: true }
});

const ticketModel = mongoose.model(ticketCollection, ticketSchema);

export default ticketModel;
