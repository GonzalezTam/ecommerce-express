export const userDTO = (user) => {
  const { _id, firstName, lastName, email, age, cart } = user;
  return { _id, firstName, lastName, email, age, cart, role: 'user' };
};

export default userDTO;
