import { usersService } from '../services/users.service.js';

const updateUserCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const cartId = req.params.cartId;
    const result = await usersService.updateUserCart(userId, cartId);
    return res.status(result.status).send(result);
  } catch (error) {
    // console.log(error);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

const usersController = {
  updateUserCart
};

export default usersController;
