import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './error.middleware.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Token de acceso requerido', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    req.user = payload;
    next();
  } catch {
    next(new AppError('Token inválido o expirado', 401));
  }
}

// Restringe el acceso a los roles indicados (debe ir después de authenticate).
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('No tenés permiso para esta acción', 403));
    }
    next();
  };
}
