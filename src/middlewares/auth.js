import bcrypt from 'bcrypt';
import passport from 'passport';
import userModel from '../dao/models/user.model.js';
import dotEnvConfig from '../config/env.config.js';

const { ADMIN_EMAIL, ADMIN_PASSWORD } = dotEnvConfig;

export const handlePolicies = policies => (req, res, next) => {
  // if PUBLIC policy is present and user is logged in, redirect to profile.
  if (policies.includes('PUBLIC') && req.session.user) return res.redirect('/profile');
  // if PUBLIC policy is present, allow access.
  if (policies.includes('PUBLIC')) return next();

  // if user is logged in, check if user role is in policies.
  if (req.session.user) {
    if (policies.length > 0) {
      if (!policies.includes(req.session.user.role.toUpperCase())) {
        req.log.warn(`[handle-policies] user ${req.session.user.email} tried to access ${req.path}`);
        return res.status(403).json({ status: 'error', error: 'You are not authorized' });
      }
    }
    next();
  } else {
    // if user is not logged in, redirect to login page.
    const path = req.path;
    const failed = req.query.failed || true;
    if (path === '/' && !req.query.failed) return res.redirect('/login');
    return res.redirect(`/login?failed=${failed}`); // `/login?failed=${failed}
  }
};

// if user is not the owner of the cart, respond with 401.
export const cartOwnership = async (req, res, next) => {
  const cartId = req.params.cid;
  if (req.session.user.cart === cartId) return next();
  else {
    req.log.warn(`[cart-ownership] user ${req.user._id} tried to access cart ${cartId}`);
    res.status(401).send({ message: 'Unauthorized' });
  }
};

export const registerValidations = async (req, res, next) => {
  const emailRegex = /\S+@\S+\.\S+/;
  const { email, password, password2, firstName, lastName, age } = req.body;

  try {
    if (!firstName) throw new Error('First name is required.');
    if (!lastName) throw new Error('Last name is required.');
    if (!age || age > 100 || age < 18) throw new Error('Specify a valid age between 18 and 100.');
    if (!email || !emailRegex.test(email)) throw new Error('Provide a valid email.');
    if (email === 'adminCoder@coder.com') throw new Error('Email not available.');
    if (!password) throw new Error('Password is required.');
    if (!password2) throw new Error('Password confirmation is required.');
    if (password !== password2) throw new Error('Passwords do not match.');

    const user = await userModel.findOne({ email });
    if (user) throw new Error('Email not available.');
  } catch (error) {
    req.log.warn(`[register-validations] ${error}`);
    return res.status(400).send({ message: `${error}` });
  }
  next();
};

export const loginValidations = (req, res, next) => {
  const emailRegex = /\S+@\S+\.\S+/;
  const { email, password } = req.body;

  try {
    if (!email && !password) throw new Error('Email and password are required.');
    if (!email || !emailRegex.test(email)) throw new Error('A valid email is required.');
    if (!password) throw new Error('Password is required.');

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
      // req.log.info(`[login-validations] admin ${reqSessionUser.email} logged in.`);
      return res.send({ message: 'Login success!', user: reqSessionUser, status: 200 });
    }
  } catch (error) {
    req.log.warn(`[login-validations] ${error}`);
    return res.status(400).send({ message: `${error}` });
  }
  next();
};

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

export const passportRegister = passport.authenticate('register', { failureRedirect: '/register?failed=true' });
export const passportLogIn = passport.authenticate('login', { failureRedirect: '/login?failed=true' });
export const passportGitHubAuth = passport.authenticate('github', { scope: ['user:email'] });
export const passportGitHubCallback = passport.authenticate('github', { failureRedirect: '/login?failed=github' });

export default {
  handlePolicies,
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
