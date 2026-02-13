import winston from 'winston';
import { ENV } from '../../config/env.js';

const isProduction = ENV.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    isProduction
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack }) => {
            return stack
              ? `${timestamp} [${level}] ${message} - ${stack}`
              : `${timestamp} [${level}] ${message}`;
          })
        )
  ),

  transports: [
    new winston.transports.Console()
  ],

  exceptionHandlers: [
    new winston.transports.Console()
  ],

  rejectionHandlers: [
    new winston.transports.Console()
  ],
});

export default logger;
