const bodyParser = require('body-parser')
const express = require('express');
const session = require('express-session')
const connectDB = require('./db/connect.js');
const MongoStore = require('connect-mongo');

const passport = require('passport');
const initializePassport = require('./config/passport.config.js');
const dotEnvConfig = require('./config/env.config.js');

const handlebars = require('express-handlebars');
const { Server } = require('socket.io');

const viewsRouter = require('./routes/views.router.js');
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const sessionRouter = require('./routes/session.router.js');

const { PORT, SOCKET_PORT, MONGO_URI, MONGO_DB_SESSION, SECRET } = dotEnvConfig;

const app = express();

try {
  connectDB(MONGO_URI);
  const httpServer = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

  app.use(express.json());
  app.use(express.static('./src/public'))
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json())

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
  }))

  initializePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  app.engine('handlebars', handlebars.engine())
  app.set('views', './src/views')
  app.set('view engine', 'handlebars')

  app.use('/api/products', productsRouter);
  app.use('/api/carts', cartsRouter);
  app.use('/api/session', sessionRouter);
  app.use('/', viewsRouter)

  const socketServer = new Server(httpServer, { port: SOCKET_PORT });

  socketServer.on('connection', (socketClient) => {
    socketClient.on('productSubmit', (data) => {
      const p = data;
      socketServer.emit('new_product', p);
    })
    socketClient.on('productDelete', (data) => {
      const pid = data._id;
      socketServer.emit('delete_product', pid);
    })
    socketClient.on('cartCreated', (data) => {
      const cart = data;
      socketServer.emit('cartCreated', cart);
    })
    socketClient.on('cartUpdated', (data) => {
      const cart = data;
      socketServer.emit('cartUpdated', cart);
    })
  })
} catch (error) {
  //console.log(error)
  console.log("Server Error")
}
