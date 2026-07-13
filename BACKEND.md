# BACKEND.md — Guía del backend (POS Ventas)

Guía práctica de cómo está construido el backend, cómo funciona internamente y **cómo crear o modificar entidades** en el futuro.

---

## 1. Tecnologías

| Herramienta | Para qué |
|---|---|
| **Node.js** | Runtime de JavaScript en el servidor |
| **Express** | Framework HTTP (rutas, middlewares) |
| **Prisma ORM** | Acceso a la base de datos y migraciones |
| **PostgreSQL** | Base de datos relacional |
| **JWT** (`jsonwebtoken`) | Autenticación (access + refresh token) |
| **bcryptjs** | Hash de contraseñas |
| **helmet** | Cabeceras HTTP de seguridad |
| **cors** | Permitir requests del frontend |
| **morgan** | Log de requests en desarrollo |
| **cookie-parser** | Leer cookies (refresh token) |
| **dotenv** | Variables de entorno |

Módulos ES (`"type": "module"`): se usa `import`/`export`, no `require`.

---

## 2. Estructura de carpetas

```
backend/
├── prisma/
│   ├── schema.prisma        # Definición de modelos (tablas) y enums
│   ├── migrations/          # Historial de migraciones SQL (generadas por Prisma)
│   └── seed.js              # Datos iniciales (roles, usuario admin)
└── src/
    ├── server.js            # Punto de entrada: levanta el servidor
    ├── app.js               # Configura Express: middlewares y montaje de rutas
    ├── config/
    │   └── env.js           # Lee y valida variables de entorno
    ├── middleware/
    │   ├── auth.middleware.js   # authenticate (JWT) y authorize (roles)
    │   └── error.middleware.js  # AppError + manejador global de errores
    └── modules/             # Un directorio por entidad/dominio
        └── <entidad>/
            ├── <entidad>.service.js     # Lógica de negocio + acceso a DB
            ├── <entidad>.controller.js  # Adapta req/res <-> service
            └── <entidad>.routes.js      # Define endpoints y middlewares
```

Cada **módulo** es autocontenido y sigue siempre el mismo patrón de 3 archivos.

---

## 3. Arquitectura por capas

Una request atraviesa **4 capas**, cada una con una responsabilidad única:

```
HTTP  →  routes  →  controller  →  service  →  Prisma  →  PostgreSQL
                       (req/res)   (negocio)    (ORM)
```

- **routes** (`*.routes.js`): declara los endpoints (`GET`, `POST`, …), aplica los middlewares (`authenticate`, `authorize`) y delega en el controller. No tiene lógica.
- **controller** (`*.controller.js`): extrae datos de `req` (params, query, body, `req.user`), llama al service y arma la respuesta `res.json(...)`. Envuelve todo en `try/catch` y pasa errores a `next(err)`. **No accede a la base de datos.**
- **service** (`*.service.js`): **toda la lógica de negocio y las consultas Prisma**. Valida reglas, lanza `AppError` ante errores esperados, usa transacciones cuando hay que tocar varias tablas de forma atómica.
- **Prisma**: el ORM. Se instancia `new PrismaClient()` en cada service.

**Regla de oro:** las consultas a la DB van **solo en el service**. El controller nunca importa Prisma.

---

## 4. Cada sección en detalle

### `server.js`
Carga `dotenv`, importa la app y hace `app.listen(env.port)`. Nada más.

### `app.js`
Ensambla Express en orden:
1. `helmet()`, `cors()`, `morgan()`, `express.json()`, `cookieParser()`
2. Montaje de cada router: `app.use('/api/<entidad>', <entidad>Routes)`
3. Health check (`GET /api/health`)
4. 404 handler
5. `errorMiddleware` (**siempre al final**)

### `config/env.js`
Centraliza la configuración desde variables de entorno. `required('X')` tira error si falta una variable crítica (ej. secrets JWT). Exporta el objeto `env`.

### `middleware/auth.middleware.js`
- **`authenticate`**: lee `Authorization: Bearer <token>`, verifica el JWT y setea `req.user = payload` (`{ sub, email, role }`). Si falla, responde 401.
- **`authorize(...roles)`**: se usa **después** de `authenticate`. Chequea que `req.user.role` esté en los roles permitidos; si no, responde 403. Ejemplo: `authorize('admin')`.

### `middleware/error.middleware.js`
- **`AppError`**: clase de error con `statusCode` (default 400). Se usa en los services para errores esperados: `throw new AppError('Cliente no encontrado', 404)`.
- **`errorMiddleware`**: captura todos los errores y responde `{ success: false, message }`. En desarrollo incluye el stack para errores 500.

### `prisma/schema.prisma`
Define los modelos (tablas), sus campos, relaciones, índices y enums. Es la **fuente de verdad** del esquema de datos.

---

## 5. Convenciones

**Formato de respuesta** (siempre):
```js
// éxito
res.json({ success: true, data });
res.status(201).json({ success: true, data }); // en create

// error (lo arma errorMiddleware)
{ success: false, message: '...' }
```

**Paginación** (listados): el service devuelve
```js
{ items, total, page, limit, pages }
```
y acepta `{ search, page = 1, limit = 20 }` por query.

**Errores esperados**: `throw new AppError('mensaje', statusCode)` en el service. Nunca `res.status()` en el service.

**Transacciones**: cuando una operación toca varias tablas y debe ser atómica, se usa `prisma.$transaction(async (tx) => { ... })`. Ejemplos reales: una venta descuenta stock + registra movimiento de inventario + movimiento de caja, todo en una transacción.

**Autoría**: el `userId` del usuario autenticado se obtiene de `req.user.sub` y se pasa al service cuando la entidad lo requiere (ventas, compras, movimientos).

---

## 6. Flujo de autenticación

- **Login** (`POST /api/auth/login`): valida email/password (bcrypt), emite un **access token** (corto, ~15m) y un **refresh token** (largo, ~7d, en cookie httpOnly, con rotación).
- **Requests protegidas**: mandan `Authorization: Bearer <access token>`. El middleware `authenticate` las valida.
- **Refresh** (`POST /api/auth/refresh`): renueva el access token usando el refresh token de la cookie.
- **Roles**: `admin`, `cajero`, `vendedor` (tabla `Role`, sembrados en `seed.js`). El rol viaja dentro del JWT y se chequea con `authorize()`.

---

## 7. Paso a paso: crear una entidad nueva

Ejemplo: agregar una entidad **`Expense`** (gasto). El patrón es idéntico para cualquier entidad.

### Paso 1 — Definir el modelo en `prisma/schema.prisma`
```prisma
model Expense {
  id        Int      @id @default(autoincrement())
  name      String
  amount    Decimal  @db.Decimal(12, 2)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
}
```
> Si la entidad se relaciona con otra (ej. un `userId`), agregá el campo relación **en ambos modelos** (ver ejemplos existentes como `Sale`/`SaleItem`).

### Paso 2 — Generar y aplicar la migración
```bash
cd backend
pnpm db:up                          # asegura Postgres corriendo (Docker)
npx prisma migrate dev --name gastos # crea la migración y regenera el client
```
> Si la migración implica borrar datos, Prisma pide confirmación interactiva.

### Paso 3 — Crear el service `src/modules/expenses/expense.service.js`
```js
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

export const expenseService = {
  async findAll({ search = '', page = 1, limit = 20 } = {}) {
    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};
    const [total, items] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({ where, orderBy: { name: 'asc' }, skip: (page - 1) * limit, take: Number(limit) }),
    ]);
    return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  async findById(id) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new AppError('Gasto no encontrado', 404);
    return expense;
  },

  async create(data) {
    return prisma.expense.create({ data: { name: data.name, amount: data.amount, active: data.active ?? true } });
  },

  async update(id, data) {
    await expenseService.findById(id);
    return prisma.expense.update({ where: { id }, data });
  },

  async remove(id) {
    await expenseService.findById(id);
    return prisma.expense.delete({ where: { id } });
  },
};
```

### Paso 4 — Crear el controller `src/modules/expenses/expense.controller.js`
```js
import { expenseService } from './expense.service.js';

export const expenseController = {
  async getAll(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const data = await expenseService.findAll({ search, page, limit });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try {
      const data = await expenseService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try {
      const data = await expenseService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async remove(req, res, next) {
    try {
      await expenseService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Gasto eliminado' });
    } catch (err) { next(err); }
  },
};
```

### Paso 5 — Crear las rutas `src/modules/expenses/expense.routes.js`
```js
import { Router } from 'express';
import { expenseController } from './expense.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);            // todas requieren login
// router.use(authorize('admin'));   // (opcional) restringir a admin

router.get('/', expenseController.getAll);
router.post('/', expenseController.create);
router.put('/:id', expenseController.update);
router.delete('/:id', expenseController.remove);

export default router;
```

### Paso 6 — Montar el router en `src/app.js`
```js
import expenseRoutes from './modules/expenses/expense.routes.js';   // con los demás imports
// ...
app.use('/api/expenses', expenseRoutes);                            // con los demás app.use
```

### Paso 7 — Probar
```bash
pnpm dev   # levanta el backend con --watch
# login para obtener token, luego:
curl -X POST http://localhost:4000/api/expenses -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" -d '{"name":"Alquiler","amount":150000}'
```

---

## 8. Cómo modificar una entidad existente

- **Agregar/quitar un campo**: editá el modelo en `schema.prisma` → `npx prisma migrate dev --name <descripcion>`. Actualizá el service (`create`/`update`) para contemplar el nuevo campo.
- **Nueva regla de negocio**: va en el **service** (validaciones, `AppError`, transacciones). No toques el controller salvo que cambie la firma.
- **Nuevo endpoint / acción** (ej. `POST /:id/receive`): agregá el método al service, al controller, y la ruta. Ejemplos reales: `sales/:id/cancel`, `purchases/:id/receive`.
- **Relación entre entidades**: definí la relación en **ambos** modelos del schema, migrá, y en el service usá `include` para traer los datos relacionados.

---

## 9. Comandos útiles (`backend/`)

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta el server con recarga (`--watch`) |
| `pnpm db:up` / `pnpm db:down` | Arranca / detiene Postgres (Docker) |
| `pnpm db:reset` | Resetea la DB (borra volúmenes) |
| `npx prisma migrate dev --name X` | Crea y aplica una migración |
| `pnpm db:seed` | Siembra roles + usuario admin |
| `pnpm db:studio` | Abre Prisma Studio (explorar la DB) |

**Credenciales del seed**: `admin@pos.com` / `admin123`.

---

## 10. Checklist para una entidad nueva

- [ ] Modelo en `schema.prisma` (+ relaciones en ambos lados si aplica)
- [ ] `npx prisma migrate dev --name <nombre>`
- [ ] `service.js` (findAll paginado, findById, create, update, remove)
- [ ] `controller.js` (try/catch + `next(err)`, respuesta `{ success, data }`)
- [ ] `routes.js` (`authenticate` + `authorize` si corresponde)
- [ ] Montaje en `app.js` (`import` + `app.use('/api/...')`)
- [ ] Probar con curl / frontend
