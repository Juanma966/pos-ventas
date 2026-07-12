import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MUTATING = ['POST', 'PUT', 'PATCH', 'DELETE'];
const METHOD_ACTION = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };

// Deriva entidad / id / acción a partir del path (/api/<entity>/<id?>/<subAction?>).
function parsePath(method, path) {
  const clean = path.split('?')[0].replace(/^\/api\//, '');
  const segments = clean.split('/').filter(Boolean);
  const entity = segments[0] ?? 'unknown';

  let entityId = null;
  let subAction = null;
  for (const seg of segments.slice(1)) {
    if (/^\d+$/.test(seg)) entityId = Number(seg);
    else subAction = seg; // ej: cancel, receive, return, active, adjustments
  }

  const action = subAction ? subAction.toUpperCase() : METHOD_ACTION[method];
  return { entity, entityId, action };
}

// Registra cada acción mutante (POST/PUT/PATCH/DELETE) de un usuario autenticado.
// Se engancha a res 'finish', cuando ya corrió authenticate (req.user disponible) y
// se conoce el status. Escribe de forma asíncrona sin bloquear la respuesta.
export function auditLogger(req, res, next) {
  if (!MUTATING.includes(req.method) || !req.path.startsWith('/api/') || req.path.startsWith('/api/auth')) {
    return next();
  }

  res.on('finish', () => {
    const userId = req.user?.sub ?? null;
    if (!userId) return; // solo acciones de usuarios autenticados

    const { entity, entityId, action } = parsePath(req.method, req.originalUrl || req.url);

    prisma.auditLog
      .create({
        data: {
          userId,
          action,
          entity,
          entityId,
          method: req.method,
          path: (req.originalUrl || req.url).split('?')[0],
          statusCode: res.statusCode,
        },
      })
      .catch(() => { /* la auditoría no debe afectar el flujo principal */ });
  });

  next();
}
