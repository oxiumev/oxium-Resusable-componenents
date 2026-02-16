import winston from 'winston';
import { ENV } from '../../config/env.js';

const isProduction = ENV.NODE_ENV === 'production';

// 1. Sensitive Keys to Redact (Only used in Production)
const SENSITIVE_KEYS = [
  'password',
  'confirmpassword',
  'token',
  'authorization',
  'cookie',
  'creditcard',
  'secret',
  'apikey'
];

// 2. The Redactor Function
const redactor = winston.format((info) => {
  const redactHelper = (obj: any, visited = new WeakSet()) => {
    if (!obj || typeof obj !== 'object') return;
    if (visited.has(obj)) return; // Prevent circular dependency crashes
    visited.add(obj);

    Object.keys(obj).forEach((key) => {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        redactHelper(obj[key], visited);
      }
    });
  };

  redactHelper(info);
  return info;
});

// 3. Create the Logger
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',

  format: winston.format.combine(
    // STEP 1: Apply Redaction ONLY if isProduction is true. 
    // If Dev, use a dummy format that does nothing (info => info).
    isProduction ? redactor() : winston.format((info) => info)(),

    // STEP 2: Add Timestamp
    winston.format.timestamp({ format: isProduction ? undefined : 'YYYY-MM-DD HH:mm:ss' }),
    
    // STEP 3: Handle Error Objects
    winston.format.errors({ stack: true }),

    // STEP 4: Format Output (JSON for Prod, Colorful for Dev)
    isProduction
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
            return stack
              ? `${timestamp} [${level}] ${message} - ${stack}`
              : `${timestamp} [${level}] ${message}${metaString}`;
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