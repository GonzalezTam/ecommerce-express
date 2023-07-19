import { Router } from 'express';
// import productModel from './../models/product.model';
import dotEnvConfig from '../config/env.config.js';
const viewsRouter = Router();

const { PORT } = dotEnvConfig;

// if user is not logged in, redirect to login page.
const auth = (req, res, next) => {
  if (req.session.user) {
    if (req.path === '/productsmanager' && req.session.user.role === 'user') return res.redirect('/products');
    else return next();
  }
  const path = req.path;
  const failed = req.query.failed || true;
  if (path === '/' && !req.query.failed) return res.redirect('/login');
  return res.redirect(`/login?failed=${failed}`); // `/login?failed=${failed}
};

// if user is logged in, redirect to profile.
const activeSession = (req, res, next) => {
  if (!req.session.user) return next();
  return res.redirect('/profile');
};

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

export default viewsRouter;
