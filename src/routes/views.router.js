import { Router } from 'express';
import dotEnvConfig from '../config/env.config.js';
import { auth, activeSession } from '../middlewares/auth.js';
const viewsRouter = Router();

const { PORT } = dotEnvConfig;

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

viewsRouter.get('/profile', auth, (req, res) => {
  const isAdmin = req.session.user?.role === 'admin';
  res.render('profile', { user: req.session.user, isAdmin });
});

viewsRouter.get('/products', auth, async (req, res) => {
  const user = req.session?.user;
  const isAdmin = req.session.user?.role === 'admin';
  let page = +req.query.page;
  if (!page) page = 1;
  let result;
  await fetch(`http://localhost:${PORT}/api/products?page=${page}`)
    .then(res => res.json())
    .then(data => {
      result = data;
    })
    .catch(err => console.log(err));
  return res.render('products', { user, isAdmin, products: result.products });
});

// This route is for admin user only
viewsRouter.get('/productsmanager', auth, async (req, res) => {
  const user = req.session?.user;
  const isAdmin = req.session.user?.role === 'admin';
  let page = +req.query.page;
  if (!page) page = 1;
  let result;
  await fetch(`http://localhost:${PORT}/api/products/manager?page=${page}`)
    .then(res => res.json())
    .then(data => {
      result = data;
    })
    .catch(err => console.log(err));
  return res.render('productsmanager', { user, isAdmin, products: result.products });
});

viewsRouter.get('/carts/:cid', auth, async (req, res) => {
  const cid = req.params.cid;
  let result;
  await fetch(`http://localhost:${PORT}/api/carts/${cid}`)
    .then(res => res.json())
    .then(data => {
      result = data.cart;
    })
    .catch(err => console.log(err));
  if (!result) return res.status(404).send({ 'Cart not found': cid });
  res.render('cart', { products: result?.products });
});

viewsRouter.get('/chat', auth, async (req, res) => {
  const user = req.session?.user;
  const isAdmin = req.session.user?.role === 'admin';
  let result;
  await fetch(`http://localhost:${PORT}/api/chat`)

    .then(res => res.json())
    .then(data => {
      result = data.messages;
    })
    .catch(err => console.log(err));
  return res.render('chat', { user, isAdmin, messages: result });
});

export default viewsRouter;
