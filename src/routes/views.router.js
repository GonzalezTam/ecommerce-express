import { Router } from 'express';
import dotEnvConfig from '../config/env.config.js';
import { handlePolicies, cartOwnership } from '../middlewares/auth.js';
import { cartsService } from '../services/carts.service.js';
import { productsService } from '../services/products.service.js';
import { usersService } from '../services/users.service.js';
import { sessionsService } from '../services/session.service.js';
const viewsRouter = Router();

const { PORT } = dotEnvConfig;

// TODO: refactor this  file.

// if user is logged in, redirect to products page.
viewsRouter.get('/', handlePolicies(['USER', 'PREMIUM', 'ADMIN']), async (req, res) => res.redirect('/products'));

viewsRouter.get('/register', handlePolicies(['PUBLIC']), (req, res) => {
  const failed = req.query.failed;
  if (failed) {
    req.log.error('[session-register] failed to register user');
    return res.render('register', { message: 'Register Failed. Something went wrong.' });
  }
  res.render('register');
});

viewsRouter.get('/login', handlePolicies(['PUBLIC']), (req, res) => {
  const failed = req.query.failed;
  if (failed === 'true') {
    req.log.error('[session-login] failed to login user');
    return res.render('login', { message: 'Login Failed. Username or password incorrect.' });
  }
  if (failed === 'github') {
    req.log.error('[session-login] failed to login user');
    return res.render('login', { message: 'Github login failed. Something went wrong..' });
  }
  res.render('login');
});

viewsRouter.get('/forgot-password', handlePolicies(['PUBLIC']), (req, res) => {
  res.render('forgotpassword');
});

viewsRouter.get('/reset-password/:token', handlePolicies(['PUBLIC']), async (req, res) => {
  const token = req.params.token;
  try {
    const result = await sessionsService.checkToken(token);
    if (result.status === 200) return res.render('resetpassword', { token });
    res.render('resetpassword', { error: result.message });
  } catch (error) {
    req.log.error(`[session-reset-password] ${error.message}`);
    res.render('resetpassword', { message: 'Invalid token' });
  }
});

viewsRouter.get('/profile', handlePolicies(['USER', 'PREMIUM', 'ADMIN']), async (req, res) => {
  // workaround to get user from session and use admin hardcoded user
  let user = req.session.user;

  const isAdmin = user?.role === 'admin';
  const isPremium = req.user?.role === 'premium';
  const isRegularUser = req.user?.role === 'user';

  // possible documents to be uploaded
  const requiredDocuments = {
    // eslint-disable-next-line quote-props
    document_id: { name: 'ID' },
    document_address: { name: 'Proof of address' },
    document_bank: { name: 'Bank statement' }
  };
  // check which documents the user has uploaded
  const userDocumentationStatus = Object.keys(requiredDocuments).map(doc => {
    const userDocument = req.user?.documents.find(document => document.fieldname === doc);
    // eslint-disable-next-line no-unneeded-ternary
    return [doc, userDocument ? true : false];
  });
  // check which documents are missing and return a string with the missing documents
  const missingDocuments = Object.entries(userDocumentationStatus).reduce((acc, curr) => {
    if (!curr[1][1]) { acc.push(requiredDocuments[curr[1][0]].name); }
    return acc;
  }, []);
  const requiredDocumentsMissing = missingDocuments.join(', ');
  // documents object to be passed to the view
  const documents = {
    userDocumentationStatus: {
      document_id: userDocumentationStatus[0][1],
      document_address: userDocumentationStatus[1][1],
      document_bank: userDocumentationStatus[2][1]
    },
    requiredDocumentsMissing
  };

  user = !isAdmin ? req.user : user;

  if (user?.cart) {
    const userCartLength = await fetch(`http://localhost:${PORT}/api/carts/${user?.cart}`)
      .then(res => res.json())
      .then(data => {
        const cartLength = data.cart?.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
        return cartLength;
      })
      .catch(err => req.log.error(`[profile] failed to fetch cart: ${err}`));
    res.render('profile', { user, isAdmin, isPremium, isRegularUser, documents, userCartLength });
  } else {
    res.render('profile', { user, isAdmin, isPremium, isRegularUser, documents, userCartLength: 0 });
  }
});

viewsRouter.get('/products', handlePolicies(['USER', 'PREMIUM', 'ADMIN']), async (req, res) => {
  // workaround to get user from session and use admin hardcoded user
  let user = req.session.user;
  const isAdmin = user?.role === 'admin';
  const isPremium = req.user?.role === 'premium';
  user = !isAdmin ? req.user : user;

  const products = await productsService.getAllProducts(req);
  if (user?.cart) {
    const userCartLength = await fetch(`http://localhost:${PORT}/api/carts/${user?.cart}`)
      .then(res => res.json())
      .then(data => {
        const cartLength = data.cart?.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
        return cartLength;
      })
      .catch(err => req.log.error(`[products] failed to fetch cart: ${err}`));
    return res.render('products', { user, isAdmin, isPremium, products, userCartLength });
  } else {
    return res.render('products', { user, isAdmin, isPremium, products, userCartLength: 0 });
  }
});

// This route is for admin/premium user only
viewsRouter.get('/productsmanager', handlePolicies(['PREMIUM', 'ADMIN']), async (req, res) => {
  // workaround to get user from session and use admin hardcoded user
  let user = req.session.user;
  const isAdmin = user?.role === 'admin';
  const isPremium = req.user?.role === 'premium';
  user = !isAdmin ? req.user : user;

  const products = await productsService.getAllProductsManager(req);
  if (user?.cart) {
    const userCartLength = await fetch(`http://localhost:${PORT}/api/carts/${user.cart}`)
      .then(res => res.json())
      .then(data => {
        const cartLength = data.cart?.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
        return cartLength;
      })
      .catch(err => req.log.error(`[productsmanager] failed to fetch cart: ${err}`));
    return res.render('productsmanager', { user, isAdmin, isPremium, products, userCartLength });
  } else {
    return res.render('productsmanager', { user, isAdmin, isPremium, products, userCartLength: 0 });
  }
});

// This route is for admin user only
viewsRouter.get('/usersmanager', handlePolicies(['ADMIN']), async (req, res) => {
  // workaround to get user from session and use admin hardcoded user
  let user = req.session.user;
  const isAdmin = user?.role === 'admin';
  user = !isAdmin ? req.user : user;

  const users = await usersService.getAllUsersManager(req);
  return res.render('usersmanager', { user, isAdmin, users });
});

viewsRouter.get('/:cid/purchase', handlePolicies(['USER', 'PREMIUM']), cartOwnership, async (req, res) => {
  try {
    const cid = req.params.cid;
    const result = await cartsService.getCheckoutDetail(req);
    if (!result.result) return res.send({ status: 404, error: result.error });
    const { cart, order, userCartLength } = result.result;
    res.render('cart', { cart, order, userCartLength, cid });
  } catch (error) {
    req.log.error(`[purchase] failed to render cart: ${error}`);
    res.status(500).send({ error: error.message });
  }
});

viewsRouter.get('/purchase/:ticketCode', handlePolicies(['USER', 'PREMIUM']), async (req, res) => {
  const ticketCode = req.params.ticketCode;
  const hasWarning = req.query.warning;
  try {
    if (ticketCode === 'error') res.render('purchase_failed');
    await fetch(`http://localhost:${PORT}/api/orders/ticket/${ticketCode}`)
      .then(res => res.json())
      .then(data => {
        const order = data.order;
        if (!order) return res.send({ status: 404, error: 'Order not found' });
        res.render('purchase_success', { order, hasWarning });
      })
      .catch(err => req.log.error(`[purchase] failed to fetch order: ${err}`));
  } catch (error) {
    req.log.error(`[purchase] failed to render purchase: ${error}`);
    res.status(500).send({ error: error.message });
  }
});

viewsRouter.get('/chat', handlePolicies(['USER', 'PREMIUM', 'ADMIN']), async (req, res) => {
  // workaround to get user from session and use admin hardcoded user
  let user = req.session.user;
  const isAdmin = user?.role === 'admin';
  const isPremium = req.user?.role === 'premium';
  user = !isAdmin ? req.user : user;

  let result;
  await fetch(`http://localhost:${PORT}/api/chat`)
    .then(res => res.json())
    .then(data => {
      result = data.messages;
    })
    .catch(err => req.log.error(`[chat] failed to fetch messages: ${err}`));
  if (user?.cart) {
    const userCartLength = await fetch(`http://localhost:${PORT}/api/carts/${user?.cart}`)
      .then(res => res.json())
      .then(data => {
        const cartLength = data.cart?.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
        return cartLength;
      })
      .catch(err => req.log.error(`[chat] failed to fetch cart: ${err}`));
    return res.render('chat', { user, isAdmin, isPremium, messages: result, userCartLength });
  } else {
    return res.render('chat', { user, isAdmin, isPremium, messages: result, userCartLength: 0 });
  }
});

export default viewsRouter;
