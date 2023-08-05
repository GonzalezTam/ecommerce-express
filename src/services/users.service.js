/* eslint-disable no-unused-vars */
import { userDTO } from '../dto/user.dto.js';
import cartModel from '../dao/models/cart.model.js';
import userModel from '../dao/models/user.model.js';

const getAllUsers = async () => {
  try {
    const users = await userModel.find({});
    const result = users.map((user) => userDTO(user));
    return { status: 200, result };
  } catch (error) {
    return { status: 404, message: error.message };
  }
};

const getAllUsersManager = async (req) => {
  try {
    const limit = req.query.limit || undefined;
    const page = req.query.page || 1;
    const email = req.query.email || null;
    const role = req.query.role || null;
    const cart = req.query.cart || null;
    const query = {
      ...(email && { email }),
      ...(role && { role }),
      ...(cart && { cart })
    };

    // if limit has a value, users will be returned with no pagination
    if (limit === 'all' || limit > 0) {
      let users = limit === 'all' ? await userModel.find(query).lean().exec() : await userModel.find(query).limit(parseInt(limit)).lean().exec();
      users = users.map((user) => userDTO(user));

      const resObj = {
        status: 'success',
        payload: users,
        count: users.length
      };
      return resObj;
    }

    // if there is no query params, all users will be returned with pagination
    const users = await userModel.paginate(query, { page, limit: 10 });
    users.docs = users.docs.map((user) => userDTO(user));

    const loopedPages = [];
    for (let i = 1; i <= users.totalPages; i++) {
      loopedPages.push({
        page: i,
        active: i === users.page - 1
      });
    }

    const resObj = {
      status: 'success',
      payload: users.docs,
      totalPages: users.totalPages,
      prevPage: users.prevPage,
      nextPage: users.nextPage,
      page: users.page || null,
      hasPrevPage: users.hasPrevPage,
      hasNextPage: users.hasNextPage,
      prevLink: users.hasPrevPage ? `/usersmanager?page=${users.prevPage}` : null,
      nextLink: users.hasNextPage ? `/usersmanager?page=${users.nextPage}` : null,
      count: users.docs.length,
      totalCount: users.totalDocs,
      loopedPages
    };
    return resObj;
  } catch (error) {
    const resObj = {
      status: 'error',
      message: 'There was an error while querying the database',
      payload: [],
      totalPages: 0,
      prevPage: null,
      nextPage: null,
      page: null,
      hasPrevPage: false,
      hasNextPage: false,
      prevLink: null,
      nextLink: null,
      count: null,
      totalCount: null
    };
    req.log.error(`[users-getAllUsersManager] ${error.message}`);
    return resObj;
  }
};

const updateUser = async (userId, user) => {
  try {
    const findUser = await userModel.findByIdAndUpdate(userId, user, { new: true });
    // const result = userDTO(findUser);
    return { status: 200, message: 'User updated' };
  } catch (error) {
    return { status: 404, message: 'User not found' };
  }
};

const updateUserCart = async (userId, cartId) => {
  try {
    const findCart = await cartModel.findById(cartId);
  } catch (error) {
    return { status: 404, message: 'Cart not found' };
  }

  try {
    const findUser = updateUser(userId, { cart: cartId });
    return { status: 200, message: 'User updated' };
  } catch (error) {
    return { status: 404, message: 'User not found' };
  }
};

const deleteUser = async (userId) => {
  try {
    const findUser = await userModel.findByIdAndDelete(userId);
    return { status: 200, message: 'User deleted' };
  } catch (error) {
    return { status: 404, message: 'User not found' };
  }
};

// TODO: implement this
const deleteInactiveUsers = async () => {};

export const usersService = {
  getAllUsers,
  getAllUsersManager,
  updateUser,
  updateUserCart,
  deleteUser,
  deleteInactiveUsers
};
