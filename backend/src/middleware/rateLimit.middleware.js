import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// En desarrollo no queremos que los límites molesten mientras se prueba.
const disabled = env.isDev;

const jsonMessage = (message) => ({ success: false, message });

// Limiter general para toda la API: frena abuso/scraping sin afectar el uso normal.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 600, // 600 requests por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => disabled,
  message: jsonMessage('Demasiadas solicitudes, intentá de nuevo en unos minutos'),
});

// Limiter estricto para login: mitiga fuerza bruta de credenciales.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // solo cuentan los intentos fallidos
  skip: () => disabled,
  message: jsonMessage('Demasiados intentos de inicio de sesión, esperá unos minutos'),
});
