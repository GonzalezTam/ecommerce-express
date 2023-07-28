import { Router } from 'express';
import dotEnvConfig from '../config/env.config.js';
import { auth, authUsersOnly, activeSession, cartOwnership } from '../middlewares/auth.js';
import { cartsService } from '../services/carts.service.js';
const viewsRouter = Router();

const { PORT } = dotEnvConfig;

// TODO: refactor this  file.
// TODO: create usermanager view with asignable roles.

// if user is logged in, redirect to products page.
viewsRouter.get('/', auth, async (req, res) => res.redirect('/products'));

viewsRouter.get('/register', activeSession, (req, res) => {
  const failed = req.query.failed;
  if (failed) return res.render('register', { message: 'Register Failed. Something went wrong.' });
  res.render('register');
});

viewsRouter.get('/login', activeSession, (req, res) => {
  const failed = req.query.failed;
  if (failed === 'true') return res.render('login', { message: 'Login Failed. Username or password incorrect.' });
  if (failed === 'github') return res.render('login', { message: 'Github login failed. Something went wrong..' });
  res.render('login');
});

viewsRouter.get('/profile', auth, async (req, res) => {
  // workaround to get user from session and use admin hardcoded user
  let user = req.session.user;
  const isAdmin = user?.role === 'admin';
  user = !isAdmin ? req.user : user;

  if (user?.cart) {
    const userCartLength = await fetch(`http://localhost:${PORT}/api/carts/${user?.cart}`)
      .then(res => res.json())
      .then(data => {
        const cartLength = data.cart?.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
        return cartLength;
      })
      .catch(err => console.log(err));
    res.render('profile', { user, isAdmin, userCartLength });
  } else {
    res.render('profile', { user, isAdmin, userCartLength: 0 });
  }
});

viewsRouter.get('/products', auth, async (req, res) => {
  // workaround to get user from session and use admin hardcoded user
  let user = req.session.user;
  const isAdmin = user?.role === 'admin';
  user = !isAdmin ? req.user : user;

  let page = +req.query.page;
  if (!page) page = 1;
  const products = await fetch(`http://localhost:${PORT}/api/products?page=${page}`)
    .then(res => res.json())
    .then(data => {
      return data.products;
    })
    .catch(err => console.log(err));
  if (user?.cart) {
    const userCartLength = await fetch(`http://localhost:${PORT}/api/carts/${user?.cart}`)
      .then(res => res.json())
      .then(data => {
        const cartLength = data.cart?.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
        return cartLength;
      })
      .catch(err => console.log(err));
    return res.render('products', { user, isAdmin, products, userCartLength });
  } else {
    return res.render('products', { user, isAdmin, products, userCartLength: 0 });
  }
});

// This route is for admin user only
viewsRouter.get('/productsmanager', auth, async (req, res) => {
  // workaround to get user from session and use admin hardcoded user
  let user = req.session.user;
  const isAdmin = user?.role === 'admin';
  user = !isAdmin ? req.user : user;

  let page = +req.query.page;
  if (!page) page = 1;
  let result;
  await fetch(`http://localhost:${PORT}/api/products/manager?page=${page}`)
    .then(res => res.json())
    .then(data => {
      result = data;
    })
    .catch(err => console.log(err));
  if (user?.cart) {
    const userCartLength = await fetch(`http://localhost:${PORT}/api/carts/${user.cart}`)
      .then(res => res.json())
      .then(data => {
        const cartLength = data.cart?.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
        return cartLength;
      })
      .catch(err => console.log(err));
    return res.render('productsmanager', { user, isAdmin, products: result.products, userCartLength });
  } else {
    return res.render('productsmanager', { user, isAdmin, products: result.products, userCartLength: 0 });
  }
});

// This route is for admin user only
viewsRouter.get('/usersmanager', auth, async (req, res) => { });

viewsRouter.get('/:cid/purchase', auth, authUsersOnly, cartOwnership, async (req, res) => {
  try {
    const cid = req.params.cid;
    const result = await cartsService.getCheckoutDetail(req);
    if (!result.result) return res.send({ status: 404, error: result.error });
    const { cart, order, userCartLength } = result.result;
    res.render('cart', { cart, order, userCartLength, cid });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

viewsRouter.get('/purchase/:ticketCode', auth, authUsersOnly, async (req, res) => {
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
      .catch(err => console.log(err));
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

viewsRouter.get('/chat', auth, async (req, res) => {
  // workaround to get user from session and use admin hardcoded user
  let user = req.session.user;
  const isAdmin = user?.role === 'admin';
  user = !isAdmin ? req.user : user;

  let result;
  await fetch(`http://localhost:${PORT}/api/chat`)
    .then(res => res.json())
    .then(data => {
      result = data.messages;
    })
    .catch(err => console.log(err));
  if (user?.cart) {
    const userCartLength = await fetch(`http://localhost:${PORT}/api/carts/${user?.cart}`)
      .then(res => res.json())
      .then(data => {
        const cartLength = data.cart?.products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
        return cartLength;
      })
      .catch(err => console.log(err));
    return res.render('chat', { user, isAdmin, messages: result, userCartLength });
  } else {
    return res.render('chat', { user, isAdmin, messages: result, userCartLength: 0 });
  }
});

export default viewsRouter;
