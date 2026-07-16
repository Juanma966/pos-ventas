// Configura el entorno de TEST.
// IMPORTANTE: este archivo debe importarse ANTES que cualquier módulo de la app,
// porque `src/config/env.js` y Prisma leen las variables al cargarse.
process.env.NODE_ENV = 'test';

// Base de datos SEPARADA para tests (mismo Postgres de Docker, otra base).
// Nunca apunta a la base de desarrollo: los tests la borran y recrean.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://pos_user:pos_password@localhost:5433/pos_ventas_test';

// Secretos de JWT solo para tests.
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'secreto_de_test_access_no_usar_en_produccion';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secreto_de_test_refresh_no_usar_en_produccion';

export const TEST_DATABASE_URL = process.env.DATABASE_URL;
