import { v4 as uuidv4 } from 'uuid';
import { userDTO } from '../dto/user.dto.js';
import { emailSender } from '../utils/mailing/emailSender.js';
import userModel from '../dao/models/user.model.js';
import passwordsResetModel from '../dao/models/passwordsReset.model.js';
import { createHash, isValidPassword } from '../middlewares/auth.js';

const getCurrent = async (req) => {
  let result;
  if (req.user) {
    const user = await userDTO(req.user);
    result = { user, status: 200 };
    return result;
  }
  result = { user: {}, error: 'User not logged in', status: 401 };
  req.log.warn('[session-getCurrent] there is no current user session');
  return result;
};

const logout = async (req) => {
  const user = req.session.user;
  req.session.destroy(err => {
    if (err) return { message: 'Logout failed', status: 400 };
    req.log.info(`[session-logout] ${user.email} session destroyed successfully`);
  });
  return { message: 'Logout success!', status: 200 };
};

const forgotPassword = async (req) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return { message: 'Ups.. it seems that this email is not registered', status: 400 };

    let token = uuidv4();
    token = token.replace(/-/g, '').substring(0, 6).toUpperCase();
    await passwordsResetModel.create({ token, email });

    const emailType = 'forgot_password';
    const emailData = { user, token };
    await emailSender(emailType, emailData);
  } catch (error) {
    req.log.error(`[session-forgotPassword] ${error.message}`);
    return { message: 'Error sending email', status: 400 };
  }
  return { message: 'Email sent successfully', status: 200 };
};

const resetPassword = async (req) => {
  try {
    const { token, password, password2 } = req.body;
    // Token is valid at this point?
    const tokenAvailable = await checkToken(token);
    if (tokenAvailable.status !== 200) return { message: tokenAvailable.message, status: 401 };
    const user = await userModel.findOne({ email: tokenAvailable.email });
    // Password validation
    if (password !== password2) return { message: 'Passwords do not match.', status: 400 };
    const repeatedPassword = await isValidPassword(user, password);
    if (repeatedPassword) return { message: 'Your new password cannot be the same as your current password.', status: 400 };
    // Update user with new password
    const newPassword = await createHash(password);
    await userModel.updateOne({ email: tokenAvailable.email }, { password: newPassword });
    return { message: 'Password changed successfully', status: 200 };
  } catch (error) {
    req.log.error(`[session-resetPassword] ${error.message}`);
    return { message: 'Error changing password', status: 400 };
  }
};

const checkToken = async (token) => {
  if (!token) return { message: 'Token not provided', status: 400 };
  const passwordsReset = await passwordsResetModel.findOne({ token });
  if (!passwordsReset) return { message: 'Ups.. This link is not valid or has expired', status: 400 };
  if (passwordsReset.isUsed) return { message: 'Ups.. This link has already been used', status: 400 };
  return { message: 'Token is valid', status: 200, email: passwordsReset.email };
};

export const sessionsService = {
  getCurrent,
  logout,
  forgotPassword,
  resetPassword,
  checkToken
};
