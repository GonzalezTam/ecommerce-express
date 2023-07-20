export const userDTO = (user) => {
  const { firstName, lastName, email, age, cart } = user;
  return { firstName, lastName, email, age, cart, role: 'user' };
};

export default userDTO;
