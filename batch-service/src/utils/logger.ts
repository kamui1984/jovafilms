import winston from 'winston';
import { config } from '../config/env';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const level = () => {
  const env = config.nodeEnv || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'white'
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [BATCH] ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/batch-error.log',
    level: 'error'
  }),
  new winston.transports.File({ filename: 'logs/batch.log' })
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});
