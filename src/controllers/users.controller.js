import { usersService } from '../services/users.service.js';

const getAllUsers = async (req, res) => {
  const result = await usersService.getAllUsers();
  res.status(result.status).send({ users: result });
};

const getAllUsersManager = async (req, res) => {
  const result = await usersService.getAllUsersManager(req);
  res.status(result.status).send({ users: result });
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = req.body;
    const result = await usersService.updateUser(userId, user);
    req.log.info(`[users-updateUser] user ${userId} updated successfully`);
    return res.status(result.status).send(result);
  } catch (error) {
    req.log.error(`[users-updateUser] ${error.message}`);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

const updateUserCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const cartId = req.params.cartId;
    const result = await usersService.updateUserCart(userId, cartId);
    req.log.info(`[users-updateUserCart] user ${userId} cart updated successfully`);
    return res.status(result.status).send(result);
  } catch (error) {
    req.log.error(`[users-updateUserCart] ${error.message}`);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await usersService.deleteUser(userId);
    req.log.info(`[users-deleteUser] user ${userId} deleted successfully`);
    return res.status(result.status).send(result);
  } catch (error) {
    req.log.error(`[users-deleteUser] ${error.message}`);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

// TODO: implement this
const deleteInactiveUsers = async (req, res) => {};

const usersController = {
  getAllUsers,
  getAllUsersManager,
  updateUser,
  updateUserCart,
  deleteUser,
  deleteInactiveUsers
};

export default usersController;
