import { PrismaClient } from '@prisma/client';

// Cliente Prisma compartido. Se usa para chequeos livianos (health check).
// Los módulos existentes instancian el suyo; migrarlos a este singleton es
// una mejora pendiente (evitaría múltiples pools de conexión).
export const prisma = new PrismaClient();
