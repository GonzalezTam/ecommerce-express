const getCurrent = async (req) => {
  let result;
  if (req.session.user) {
    result = { user: req.session.user, status: 200 };
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
