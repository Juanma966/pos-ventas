import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Variable de entorno requerida: ${key}`);
  return value;
};

// Valores de ejemplo que NUNCA deben usarse en producción.
const INSECURE_SECRETS = new Set([
  'cambiar_por_secreto_seguro',
  'cambiar_por_otro_secreto_seguro',
]);

// En producción los secretos deben ser fuertes y no los del .env.example.
const secret = (key) => {
  const value = required(key);
  if (isProd) {
    if (INSECURE_SECRETS.has(value)) {
      throw new Error(`${key} usa el valor de ejemplo: cambialo por un secreto real en producción`);
    }
    if (value.length < 32) {
      throw new Error(`${key} es demasiado corto para producción (mínimo 32 caracteres)`);
    }
  }
  return value;
};

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: !isProd,

  jwt: {
    accessSecret: secret('JWT_ACCESS_SECRET'),
    refreshSecret: secret('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
