import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { ENV } from '../../config/env.js';

const isProduction = ENV.NODE_ENV === 'production';

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${Math.floor(ms)}ms`;
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor(ms / (1000 * 60));
  const millis = Math.floor(ms % 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s ${millis}ms`;
  }
  return `${seconds}s ${millis}ms`;
};

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: true,
        },
      }
    : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.confirmPassword',
      'req.body.email',
      'req.body.token',
      'req.body.creditCard',
      'req.body.cvv',
    ],
    remove: true,
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

export const loggerMiddleware = pinoHttp({
  logger,
  
  genReqId: (req: Request, res: Response) => {
    const existingID = req.headers['x-request-id'] || req.headers['trace-id'];
    const id = existingID ? existingID.toString() : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },

  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (req.url === '/health' || req.url === '/status') return 'silent';
    return 'info';
  },

  customSuccessMessage: (req, res, responseTime) => {
    const method = req.method;
    const url = req.url;
    const status = res.statusCode;
    const duration = formatDuration(responseTime); 

    if (status === 404) return `🔍 404 Not Found: ${method} ${url}`;
        return `✅ ${method} ${url} completed - ${status} (${duration})`;
  },

  customErrorMessage: (req, res, err) => {
    return `❌ ${req.method} ${req.url} failed with ${res.statusCode} | Error: ${err?.message}`;
  },

  customProps: (req, res) => ({
    env: ENV.NODE_ENV,
    context: isProduction ? 'HTTPS' : 'HTTP',
  }),
});