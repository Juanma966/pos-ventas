import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorMiddleware(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDev && statusCode === 500 && { stack: err.stack }),
  });
}
