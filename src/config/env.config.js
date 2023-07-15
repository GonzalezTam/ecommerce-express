const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Export module
module.exports = dotEnvConfig = {
	PORT,
	SOCKET_PORT,
	MONGO_URI
};
