import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import connectDB from './dao/MongoConnect.js';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import dotEnvConfig from './config/env.config.js';
import { Server } from 'socket.io';

import viewsRouter from './routes/views.router.js';
import apiRouter from './routes/api.router.js';

import Handlebars from 'handlebars';
import handlebars from 'express-handlebars';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';

const { PORT, SOCKET_PORT, MONGO_URI, MONGO_DB_SESSION, SECRET } = dotEnvConfig;

const app = express();

try {
  connectDB(MONGO_URI);
  const httpServer = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

  app.use(express.json());
  app.use(express.static('./src/public'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(session({
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      dbName: MONGO_DB_SESSION,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    }),
    secret: SECRET,
    resave: true,
    saveUninitialized: true
  }));

  initializePassport();
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api', apiRouter);
  app.use('/', viewsRouter);

  app.set('view engine', 'hbs');
  app.engine('handlebars', handlebars.engine({
    extname: 'handlebars',
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
  }));
  app.set('views', './src/views');
  app.set('view engine', 'handlebars');

  const socketServer = new Server(httpServer, { port: SOCKET_PORT });

  socketServer.on('connection', (socketClient) => {
    socketClient.on('productSubmit', (data) => {
      const p = data;
      socketServer.emit('new_product', p);
    });
    socketClient.on('productDelete', (data) => {
      const pid = data._id;
      socketServer.emit('delete_product', pid);
    });
    socketClient.on('productUpdate', (data) => {
      const p = data;
      socketServer.emit('update_product', p);
    });
    socketClient.on('cartCreated', (data) => {
      const cart = data;
      socketServer.emit('cartCreated', cart);
    });
    socketClient.on('cartUpdated', (data) => {
      const cart = data;
      socketServer.emit('cartUpdated', cart);
    });
    socketClient.on('messageSent', (data) => {
      const m = data;
      socketServer.emit('history', m);
    });
  });
} catch (error) {
  // console.log(error);
  console.log('Server Error');
}
