export const userDTO = (user) => {
  const { _id, firstName, lastName, email, age, cart, role } = user;
  return { _id, firstName, lastName, email, age, cart, role };
};

export default userDTO;
