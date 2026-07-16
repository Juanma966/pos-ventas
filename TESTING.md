# TESTING.md — Guía de tests del backend

Cómo están hechos los tests del proyecto, qué herramientas usan y **cómo escribir
uno nuevo paso a paso**. Pensado para aprender leyendo el código real de `backend/tests/`.

---

## 1. Qué tipo de tests son y por qué

Son **tests de integración**: levantan la API Express **real** y le pegan por HTTP,
con una base de datos Postgres **real** (pero separada). No se mockea nada.

¿Por qué integración y no unitarios? Porque en este backend la lógica vive en el
flujo completo: *request → middleware de auth → validación Zod → service → Prisma → DB*.
Un test unitario con la DB mockeada no detectaría un `authorize()` mal puesto o
una transacción que no repone stock. El test de integración prueba **lo que el
usuario real experimenta**.

## 2. Qué se usó (y qué NO)

| Herramienta | Qué hace | Por qué |
|---|---|---|
| **`node:test`** | El test runner (define `test`, `describe`, `before`...) | Viene **incluido en Node 20** — cero dependencias, sin magia |
| **`node:assert/strict`** | Las verificaciones (`assert.equal`, `assert.ok`) | También incluido en Node |
| **`fetch`** | Hacer los requests HTTP a la API | Global en Node 20, no hace falta axios |
| **Base `pos_ventas_test`** | DB exclusiva para tests | Se borra y recrea en cada corrida; **nunca toca tu base de dev** |
| **`prisma migrate reset`** | Recrea el esquema desde las migraciones | Estado inicial conocido = tests deterministas |

**No** se usó Jest ni Vitest: para un backend chico, el runner nativo alcanza y es
una dependencia menos que mantener.

## 3. Estructura

```
backend/tests/
├── helpers/
│   ├── env.js          # Setea NODE_ENV=test y la DATABASE_URL de test (SIEMPRE se importa primero)
│   └── testServer.js   # Levanta la app en un puerto libre + helpers api() y login()
├── reset-db.js         # Recrea la DB de test + seed + usuarios de prueba por rol
├── auth.test.js        # Login, validaciones, /me
├── permissions.test.js # La matriz de permisos por rol (admin/cajero/vendedor)
├── sales.test.js       # Ventas: stock, anulación, devolución parcial
└── cash.test.js        # Caja: apertura, movimientos, venta en efectivo, cierre/arqueo
```

**Orden de una corrida** (`pnpm test`):
1. `reset-db.js` → borra y recrea `pos_ventas_test`, aplica migraciones, corre el
   seed (admin, categorías, productos) y crea los usuarios `cajero@test.com` y
   `vendedor@test.com`.
2. `node --test --test-concurrency=1 tests/` → corre cada archivo `*.test.js`
   (de a uno, porque comparten la DB).

## 4. Cómo correr los tests

```bash
cd backend
docker compose up -d     # el Postgres de dev debe estar corriendo
pnpm test
```

Salida esperada: `# pass 67 / # fail 0`. Si un test falla, muestra qué esperaba
(`expected`), qué recibió (`actual`) y en qué archivo/línea.

Correr **un solo archivo** (más rápido mientras desarrollás):

```bash
node tests/reset-db.js          # solo si necesitás resetear la DB
node --test tests/sales.test.js
```

## 5. Anatomía de un test (el patrón AAA)

Todo test sigue tres pasos: **Arrange** (preparar), **Act** (ejecutar), **Assert** (verificar).

```js
test('el vendedor crea una venta y el stock se descuenta', async () => {
  // ARRANGE: ya tenemos un producto con stock 10 (creado en el before)

  // ACT: ejecutar la acción que queremos probar
  const res = await srv.api('POST', '/sales', {
    token: tokens.vendedor,
    body: { paymentMethod: 'TARJETA', items: [{ productId: product.id, quantity: 3 }] }
  });

  // ASSERT: verificar el resultado
  assert.equal(res.status, 201);            // se creó
  assert.equal(Number(res.data.total), 300); // 3 x $100
  assert.equal(await getStock(product.id), 7); // 10 - 3: el efecto en la DB
});
```

Piezas del runner (`import { describe, test, before, after } from 'node:test'`):

- `describe('grupo', ...)` — agrupa tests relacionados (aparece en la salida).
- `test('nombre', async () => {...})` — un caso. El nombre describe **el comportamiento esperado**, no la implementación.
- `before(...)` / `after(...)` — se ejecutan una vez antes/después de todos los
  tests del archivo. Acá levantamos/cerramos el servidor y creamos datos base.
- `assert.equal(real, esperado, mensaje?)` — falla si no son iguales. El tercer
  parámetro opcional se muestra al fallar (útil: `JSON.stringify(res.body)`).
- `assert.ok(valor)` — falla si el valor es falsy.

## 6. Los helpers (para no repetir código)

```js
const srv = await startTestServer();        // app real en un puerto libre
const token = await srv.login(USERS.cajero); // devuelve el JWT
const res = await srv.api('GET', '/products', { token });
// res.status → código HTTP | res.data → el payload | res.body → respuesta completa
```

Detalle importante: `helpers/env.js` se importa **antes que nada** en cada archivo,
porque la app lee `DATABASE_URL` y los secretos JWT al cargarse. Por eso
`testServer.js` importa la app con un `import()` dinámico *después* de setear el env.

## 7. Trucos que vale la pena entender

**Probar permisos sin crear datos (403 vs 400):** para saber si un rol puede
escribir en un endpoint, se manda un **body inválido** `{}`:
- Si el rol **no** está autorizado → `403` (lo corta el middleware `authorize`).
- Si **sí** está autorizado → `400` (pasó la autorización y lo frenó la validación Zod).

Así se prueba toda la matriz de permisos sin efectos secundarios. Mismo truco con
`POST /sales/999999/cancel`: `404` = autorizado (no encontró la venta), `403` = bloqueado.

**Datos propios por suite:** `sales.test.js` crea *su propio* producto con nombre
único (`Producto Test Ventas ${Date.now()}`) en vez de usar los del seed. Así un
test no rompe a otro por compartir datos.

**Decimales de Prisma:** los campos `Decimal` llegan como *string* en el JSON
(`"total": "300"`). Por eso se compara con `Number(sale.total)`.

## 8. Cómo escribir un test nuevo (paso a paso)

Supongamos que querés testear que *no se puede crear un producto con precio negativo*:

1. Elegí el archivo (o creá `tests/products.test.js` copiando la estructura de otro).
2. Escribí el caso:

```js
test('no permite crear un producto con precio negativo', async () => {
  const res = await srv.api('POST', '/products', {
    token: tokens.admin,
    body: { name: 'Inválido', price: -5, cost: 1, categoryId: 1 }
  });
  assert.equal(res.status, 400);
});
```

3. Corré `node --test tests/products.test.js` y mirá que pase.
4. **Verificá que el test puede fallar**: rompé el assert a propósito
   (`assert.equal(res.status, 999)`), confirmá que falla, y volvé a arreglarlo.
   Un test que nunca falla no prueba nada.

## 9. Buenas prácticas que siguen estos tests

- **Un comportamiento por test** — si falla, sabés exactamente qué se rompió.
- **Nombres que describen el negocio** — "el cajero anula la venta y el stock se repone" se entiende sin leer el código.
- **Sin dependencia del orden entre archivos** — cada suite crea lo que necesita.
- **Verificar el efecto real, no solo el status** — no alcanza con el `201` de la
  venta: también se chequea que el stock bajó en la DB.
- **La DB de test se resetea siempre** — nunca dependas de datos que dejó una corrida anterior.

## 10. Qué falta a futuro (ideas)

- Tests de compras (recepción actualiza stock y costo) e inventario (ajustes).
- Tests del frontend (Vitest + React Testing Library) — otro mundo, otra guía.
- Correr la suite automáticamente en cada push (GitHub Actions).
