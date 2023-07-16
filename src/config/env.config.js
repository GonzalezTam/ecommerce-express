const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_ECOMMERCE = process.env.MONGO_DB_ECOMMERCE
const MONGO_DB_SESSION = process.env.MONGO_DB_SESSION
const SECRET = process.env.SECRET;

const GITHUB_CLIENT_ID= process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET= process.env.GITHUB_CLIENT_SECRET
const GITHUB_CALLBACK_URL= process.env.GITHUB_CALLBACK_URL

// Export module
module.exports = dotEnvConfig = {
	PORT,
	SOCKET_PORT,
	MONGO_URI,
	MONGO_DB_ECOMMERCE,
	MONGO_DB_SESSION,
	SECRET,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GITHUB_CALLBACK_URL
};
