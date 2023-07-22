import { userDTO } from '../dto/user.dto.js';

const getCurrent = async (req) => {
  let result;
  if (req.user) {
    const user = await userDTO(req.user);
    result = { user, status: 200 };
    return result;
  }
  result = { user: {}, error: 'User not logged in', status: 401 };
  return result;
};

const logout = async (req) => {
  req.session.destroy(err => {
    if (err) return { message: 'Logout failed', status: 400 };
  });
  return { message: 'Logout success!', status: 200 };
};

export const sessionsService = {
  getCurrent,
  logout
};
