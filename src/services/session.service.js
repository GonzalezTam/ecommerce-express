import { userDTO } from '../dto/user.dto.js';

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

export const sessionsService = {
  getCurrent,
  logout
};
