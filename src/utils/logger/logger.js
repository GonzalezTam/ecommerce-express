import winston from 'winston';
import dotEnvConfig from '../../config/env.config.js';

const { ENVIRONMENT } = dotEnvConfig;

const customWinstonOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    notice: 4,
    http: 5,
    debug: 6
  },

  colors: {
    debug: 'white bold',
    http: 'blue bold',
    notice: 'cyan bold',
    info: 'green bold',
    warn: 'yellow bold',
    error: 'red bold',
    fatal: 'magenta bold'
  }
};

winston.addColors(customWinstonOptions.colors);

const prod = ENVIRONMENT === 'production';

const createLogger = () => {
  if (prod) {
    return winston.createLogger({
      levels: customWinstonOptions.levels,
      level: 'info',
      transports: [
        new winston.transports.File({
          filename: './errors.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    });
  }
  return winston.createLogger({
    levels: customWinstonOptions.levels,
    level: 'debug',
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]
  });
};

const log = createLogger(ENVIRONMENT);

export default log;
