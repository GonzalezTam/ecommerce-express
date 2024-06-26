import dotenv from 'dotenv';
import mongoConnection from '../dao/MongoConnect.js';
import commander from '../utils/commander/commander.js';

const { mode } = commander.opts();

// Load env vars
dotenv.config();

const DOMAIN = process.env.DOMAIN;
const ENVIRONMENT = mode;
const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = mode === 'test' ? process.env.MONGO_DB_TEST : (mode === 'production' ? process.env.MONGO_DB_PROD : process.env.MONGO_DB_DEV);
const MONGO_DB_SESSION = process.env.MONGO_DB_SESSION;
const SECRET = process.env.SECRET;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = DOMAIN + process.env.GITHUB_CALLBACK_URL;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

const dotEnvConfig = {
  DOMAIN,
  ENVIRONMENT,
  PORT,
  SOCKET_PORT,
  MONGO_URI,
  MONGO_DB,
  MONGO_DB_SESSION,
  SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  GMAIL_USER,
  GMAIL_PASSWORD,
  DB_CONNECT: async () => await mongoConnection(MONGO_URI, MONGO_DB)
};

// Export module
export default dotEnvConfig;
