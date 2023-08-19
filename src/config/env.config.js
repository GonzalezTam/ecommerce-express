import dotenv from 'dotenv';
import mongoConnection from '../dao/MongoConnect.js';
import commander from '../utils/commander/commander.js';

const { mode } = commander.opts();

// Load env vars
dotenv.config();

const ENVIRONMENT = mode;
const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_TEST = process.env.MONGO_DB_TEST;
const MONGO_DB_PROD = process.env.MONGO_DB_PROD;
const MONGO_DB_SESSION = process.env.MONGO_DB_SESSION;
const SECRET = process.env.SECRET;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

const dotEnvConfig = {
  ENVIRONMENT,
  PORT,
  SOCKET_PORT,
  MONGO_URI,
  MONGO_DB_TEST,
  MONGO_DB_PROD,
  MONGO_DB_SESSION,
  SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  GMAIL_USER,
  GMAIL_PASSWORD,
  DB_CONNECT: async () => await mongoConnection(MONGO_URI, MONGO_DB_PROD)
};

// Export module
export default dotEnvConfig;
