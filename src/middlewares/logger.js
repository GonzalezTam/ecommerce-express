import logger from '../utils/logger/logger.js';

const loggerMiddleware = (req, res, next) => { req.log = logger; next(); };

export default loggerMiddleware;
