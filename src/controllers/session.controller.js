import { sessionsService } from '../services/session.service.js';

const getCurrent = async (req, res) => {
  const result = await sessionsService.getCurrent(req);
  res.status(result.status).send(result);
};

const register = async (req, res) => res.redirect('/login');

const login = async (req, res) => {
  if (!req.user) {
    return res.status(400).send({ status: 'error', message: 'Email or password incorrect' });
  }
  req.session.user = {
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    age: req.user.age,
    cart: req.user.cart,
    role: 'user'
  };
  res.status(200).send({ status: 200, message: 'Login successful' });
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
