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

const updateUserPremium = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await usersService.updateUserPremium(userId);
    req.log.info(`[users-updateUserPremium] ${result.message}`);
    return res.status(result.status).send(result);
  } catch (error) {
    req.log.error(`[users-updateUserPremium] ${error.message}`);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

const getUserDocuments = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await usersService.getUserDocuments(userId);
    req.log.info(`[users-getUserDocuments] ${result.message}`);
    return res.status(result.status).send(result);
  } catch (error) {
    req.log.error(`[users-getUserDocuments] ${error.message}`);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

const uploadDocuments = async (req, res) => {
  try {
    const userId = req.params.id;
    const documents = req.files;
    const result = await usersService.uploadDocuments(userId, documents);
    if (result.status === 200) {
      req.user.documents = result.documents;
    }
    req.log.info(`[users-uploadDocuments] ${result.message}`);
    return res.status(result.status).send(result);
  } catch (error) {
    req.log.error(`[users-uploadDocuments] ${error.message}`);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

const deleteInactiveUsers = async (req, res) => {
  try {
    const result = await usersService.deleteInactiveUsers();
    req.log.info(`[users-deleteInactiveUsers] ${result.message}`);
    return res.status(result.status).send(result);
  } catch (error) {
    req.log.error(`[users-deleteInactiveUsers] ${error.message}`);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

const usersController = {
  getAllUsers,
  getAllUsersManager,
  updateUser,
  updateUserCart,
  deleteUser,
  updateUserPremium,
  getUserDocuments,
  uploadDocuments,
  deleteInactiveUsers
};

export default usersController;
