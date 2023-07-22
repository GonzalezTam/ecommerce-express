import { sessionsService } from '../services/session.service.js';
import { userDTO } from '../dto/user.dto.js';

const getCurrent = async (req, res) => {
  // hardcode admin user (is not in db)
  if (req.session.user?.role === 'admin') {
    const result = { user: { ...req.session.user }, status: 200 };
    return res.status(result.status).send(result);
  }
  // for regular users
  const result = await sessionsService.getCurrent(req);
  res.status(result.status).send(result);
};

const register = async (req, res) => res.redirect('/login');

const login = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).send({ status: 'error', message: 'Email or password incorrect' });
    }

    const user = userDTO(req.user);
    req.session.user = user;

    res.status(200).send({ status: 200, message: 'Login successful' });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

const logout = async (req, res) => {
  const result = await sessionsService.logout(req);
  res.status(result.status).send(result);
};

const githubCallback = async (req, res) => {
  req.session.user = req.user;
  res.redirect('/products');
};

const sessionsController = {
  getCurrent,
  register,
  login,
  githubCallback,
  logout
};

export default sessionsController;
