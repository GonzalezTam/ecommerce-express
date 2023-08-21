import { sessionsService } from '../services/session.service.js';
import { userDTO } from '../dto/user.dto.js';
import passwordsResetModel from '../dao/models/passwordsReset.model.js';

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
    // req.log.info(`[session-login] ${user.email} logged in successfully`);
    res.status(200).send({ status: 200, message: 'Login successful' });
  } catch (error) {
    req.log.error(`[session-login] ${error.message}`);
    return res.status(400).send({ status: 'error', message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const result = await sessionsService.forgotPassword(req);
  res.status(result.status).send(result);
};

const resetPassword = async (req, res) => {
  const result = await sessionsService.resetPassword(req);
  if (result.status === 200) await passwordsResetModel.updateOne({ token: req.body.token }, { isUsed: true });
  res.status(result.status).send(result);
};

const logout = async (req, res) => {
  const result = await sessionsService.logout(req);
  res.status(result.status).send(result);
};

const githubCallback = async (req, res) => {
  req.session.user = userDTO(req.user);
  // if (req.session.user) req.log.info(`[session] ${req.session.user.email} logged in with GitHub successfully`);
  res.redirect('/products');
};

const sessionsController = {
  getCurrent,
  register,
  login,
  forgotPassword,
  resetPassword,
  githubCallback,
  logout
};

export default sessionsController;
