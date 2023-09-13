/* eslint-disable camelcase */
export const userDTO = (user) => {
  const { _id, firstName, lastName, email, age, cart, role } = user;
  return { _id, firstName, lastName, email, age, cart, role };
};

export const userMinimalDTO = (user) => {
  const { firstName, lastName, email, role, last_connection } = user;
  return {
    fullName: `${firstName} ${lastName}`,
    email,
    role,
    last_connection
  };
};

export default userDTO;
