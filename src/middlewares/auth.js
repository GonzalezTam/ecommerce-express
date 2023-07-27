import bcrypt from 'bcrypt';
import passport from 'passport';
import userModel from '../dao/models/user.model.js';
import dotEnvConfig from '../config/env.config.js';

const { ADMIN_EMAIL, ADMIN_PASSWORD } = dotEnvConfig;

// if user is not logged in, redirect to login page.
export const auth = (req, res, next) => {
  if (req.session.user) {
    if (req.path === '/productsmanager' && req.session.user.role === 'user') return res.redirect('/products');
    else return next();
  }
  const path = req.path;
  const failed = req.query.failed || true;
  if (path === '/' && !req.query.failed) return res.redirect('/login');
  return res.redirect(`/login?failed=${failed}`); // `/login?failed=${failed}
};

export const authUsersOnly = (req, res, next) => {
  if (req.session.user?.role === 'user') return next();
  return res.redirect('/');
};

// if user is logged in, redirect to profile.
export const activeSession = (req, res, next) => {
  if (!req.session.user) return next();
  return res.redirect('/profile');
};

// if user is not the owner of the cart, respond with 401.
export const cartOwnership = async (req, res, next) => {
  const cartId = req.params.cid;
  if (req.user.cart === cartId) return next();
  else res.status(401).send({ message: 'Unauthorized' });
};

export const registerValidations = async (req, res, next) => {
  const emailRegex = /\S+@\S+\.\S+/;
  const { email, password, password2, firstName, lastName, age } = req.body;

  if (!firstName) return res.status(400).send({ message: 'First name is required.' });
  if (!lastName) return res.status(400).send({ message: 'Last name is required.' });
  if (!age || age > 100 || age < 18) return res.status(400).send({ message: 'Specify a valid age between 18 and 100.' });
  if (!email || !emailRegex.test(email)) return res.status(400).send({ message: 'Provide a valid email.' });
  if (email === 'adminCoder@coder.com') return res.status(400).send({ message: 'Email not available.' });
  if (!password) return res.status(400).send({ message: 'Password is required.' });
  if (!password2) return res.status(400).send({ message: 'Password confirmation is required.' });
  if (password !== password2) return res.status(400).send({ message: 'Passwords do not match.' });

  try {
    const user = await userModel.findOne({ email });
    if (user) return res.status(400).send({ message: 'Email already registered.' });
  } catch (error) {
    return res.status(400).send({ message: `Error: ${error}` });
  }
  next();
};

export const loginValidations = (req, res, next) => {
  const emailRegex = /\S+@\S+\.\S+/;
  const { email, password } = req.body;
  if (!email && !password) return res.status(400).send({ message: 'Email and password are required.' });
  if (!email || !emailRegex.test(email)) return res.status(400).send({ message: 'A valid email is required.' });
  if (!password) return res.status(400).send({ message: 'Password is required.' });

  // Hardcoded admin user
  if (email === ADMIN_EMAIL) {
    if (password !== ADMIN_PASSWORD) return res.status(401).send({ message: 'Login failed. Wrong password.' });
    const reqSessionUser = {
      _id: undefined,
      email,
      firstName: 'Administrator',
      lastName: null,
      age: null,
      role: 'admin'
    };
    req.session.user = reqSessionUser;
    return res.send({ message: 'Login success!', user: reqSessionUser, status: 200 });
  }
  next();
};

export const createHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

export const passportRegister = passport.authenticate('register', { failureRedirect: '/register?failed=true' });
export const passportLogIn = passport.authenticate('login', { failureRedirect: '/login?failed=true' });
export const passportGitHubAuth = passport.authenticate('github', { scope: ['user:email'] });
export const passportGitHubCallback = passport.authenticate('github', { failureRedirect: '/login?failed=github' });

export default {
  auth,
  authUsersOnly,
  activeSession,
  cartOwnership,
  loginValidations,
  registerValidations,
  createHash,
  isValidPassword,
  passportRegister,
  passportLogIn,
  passportGitHubAuth,
  passportGitHubCallback
};
