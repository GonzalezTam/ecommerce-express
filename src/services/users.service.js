/* eslint-disable no-unused-vars */
import cartModel from '../dao/models/cart.model.js';
import userModel from '../dao/models/user.model.js';

const updateUserCart = async (userId, cartId) => {
  try {
    const findCart = await cartModel.findById(cartId);
  } catch (error) {
    return { status: 404, message: 'Cart not found' };
  }

  try {
    const findUser = await userModel.findByIdAndUpdate(userId, { cart: cartId }, { new: true });
    return { status: 200, message: 'User cart updated' };
  } catch (error) {
    return { status: 404, message: 'User not found' };
  }
};

export const usersService = {
  updateUserCart
};
