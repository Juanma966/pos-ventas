import { AppError } from './error.middleware.js';

// Valida req[source] contra un esquema Zod.
// Si falla, responde 400 con un mensaje legible; si pasa, reemplaza req[source]
// con el dato ya parseado (tipos coercionados y claves desconocidas removidas).
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => {
          const path = i.path.join('.');
          return path ? `${path}: ${i.message}` : i.message;
        })
        .join('; ');
      return next(new AppError(message || 'Datos inválidos', 400));
    }
    req[source] = result.data;
    next();
  };
}
