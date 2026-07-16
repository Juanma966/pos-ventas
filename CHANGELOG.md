# CHANGELOG — POS Ventas

## 2026-07-16 — Base de tests de integración del backend

**Agregado:**

- Suite de tests de integración con `node:test` (runner nativo de Node 20, sin dependencias nuevas): 67 tests en 4 suites — `auth` (login/validación/me), `permissions` (matriz completa de roles admin/cajero/vendedor), `sales` (stock, anulación, devolución parcial) y `cash` (apertura única, movimientos, venta en efectivo → movimiento automático, cierre con arqueo)
- Infraestructura: base de datos de test separada (`pos_ventas_test`) que se resetea en cada corrida (`tests/reset-db.js`), helpers `tests/helpers/env.js` y `testServer.js` (app real en puerto libre + `fetch`)
- Script `pnpm test` en `backend/package.json`
- `TESTING.md`: guía didáctica de cómo están hechos los tests y cómo escribir nuevos

---

## 2026-07-13 — Fase 15: Producción (seguridad, Docker, backups, docs)

**Agregado:**

- **Seguridad (15A):** rate limiting con `express-rate-limit` (limiter general de la API + limiter estricto en `/api/auth/login`), límite de body JSON a 2 MB, `trust proxy` en producción y validación de entorno que aborta el arranque si los secretos JWT son débiles o los de ejemplo. Archivos: `backend/src/middleware/rateLimit.middleware.js`, `app.js`, `config/env.js`.
- **Docker (15B):** `backend/Dockerfile` (Node 20 + pnpm, `prisma generate`, `migrate deploy` al arrancar), `frontend/Dockerfile` (build multi-stage con Vite servido por nginx), `frontend/nginx.conf` (SPA fallback + proxy de `/api` + gzip/cache), `docker-compose.prod.yml` (postgres + backend + frontend), `.env.prod.example`. `packageManager: pnpm@10.34.4` en el backend.
- **Backups y operación (15C):** health check `/api/health` con chequeo de conexión a la base (503 si está caída), cliente Prisma compartido (`config/prisma.js`), healthcheck del backend en el compose (el frontend espera a que esté sano), `scripts/backup.sh` (pg_dump con retención) y `scripts/restore.sh`.
- **Documentación (15D):** `DEPLOY.md` (guía de despliegue en VPS), `README.md`, cierre de la Fase 15 en el ROADMAP.

Cierra la Fase 15 y el roadmap original del proyecto.

---

## 2026-07-13 — Nuevo módulo: Personal (empleados)

**Agregado:**

- Modelos `Employee` y `EmployeeMovement` + enum `EmployeeMovementType` (ADELANTO/DESCUENTO/PAGO) + migración `20260713173804_personal`
- Backend: módulo `employees` en `/api/employees` — CRUD de empleados + movimientos (`POST/DELETE /:id/movements`). El detalle calcula un `summary` (totales por tipo + "entregado neto" = adelantos + pagos − descuentos); el listado adjunta el neto por empleado. Empleados independientes de los Usuarios del sistema
- Frontend: `employeeService`, hook `useEmployees`, página `/personal` (grupo Personas) con `EmployeeTable`, `EmployeeFormModal` y `EmployeeDetailModal` (ledger de movimientos + alta/baja + resumen)

Ledger continuo (sueldo como referencia, sin liquidación mensual). Sin integración con Caja. Cierra la tanda de módulos adicionales (Gastos Fijos + Personal).

---

## 2026-07-13 — Nuevo módulo: Gastos Fijos

**Agregado:**

- Modelo `FixedExpense` + enum `FixedExpenseCategory` (ALQUILER/SERVICIO/CREDITO/OTRO) + migración `20260713171549_gastos_fijos`
- Backend: módulo `fixed-expenses` en `/api/fixed-expenses` (CRUD + `GET /summary` con total mensual y desglose por categoría)
- Frontend: `fixedExpenseService`, hooks `useFixedExpenses` / `useFixedExpensesSummary`, página `/gastos-fijos` (`ExpensesPage` + `ExpenseTable` + `ExpenseFormModal`) con item de menú en Administración
- Widget `FixedExpensesCard` en el dashboard (total mensual + desglose por categoría)
- Constantes `EXPENSE_CATEGORIES` / `EXPENSE_CATEGORY_LABELS`

Sin integración con Caja (por decisión). Próximo módulo: Personal.

---

## 2026-07-13 — Fase 14 cerrada + eliminación de Auditoría

**Eliminado:**

- Módulo de Auditoría completo (Fase 13): backend (`modules/audit`, `middleware/audit.middleware.js`, montajes en `app.js`), frontend (`pages/audit`, `useAudit`, `auditService`, item de menú y ruta `/auditoria`) y la tabla `AuditLog` (migración `20260713153550_eliminar_auditoria`). Motivo: no aporta valor para un POS de comercio.

**Cambiado:**

- Fase 14 cerrada: la optimización de consultas backend se descarta (volumen chico). Frontend (cache SWR + code-splitting) quedó de la entrega anterior.

---

## 2026-07-13 — Fase 14 (parcial): optimización frontend

**Cambiado:**

- `App.jsx`: `SWRConfig` global (`revalidateOnFocus: false`, `dedupingInterval: 5000`, `keepPreviousData: true`, `errorRetryCount: 2`) — menos requests redundantes y navegación/paginación sin parpadeo
- `vite.config.mjs`: `manualChunks` (función) para separar vendors en chunks propios (react-vendor, mui-core, mui-icons, charts, forms, icons-tabler)

**Impacto:** el chunk principal de la app pasó de ~811 KB a ~263 KB; las librerías pesadas (MUI, ApexCharts, RHF/Zod) quedan en chunks cacheables que no cambian entre deploys. Lazy loading de rutas ya estaba. Pendiente: optimización de consultas backend.

---

## 2026-07-12 — Fase 13 completa: auditoría

**Agregado:**

- Modelo `AuditLog` (usuario, acción, entidad, entityId, método, path, statusCode) + migración `20260712205142_auditoria`
- Middleware global `auditLogger`: registra cada acción mutante (POST/PUT/PATCH/DELETE) de un usuario autenticado al finalizar la respuesta, derivando entidad/id/acción del path — **incluye intentos fallidos** (ej. 403/400). No bloquea el flujo (escritura async, tolerante a errores)
- Backend: módulo `audit` en `/api/audit` (listado con filtros por usuario/entidad/acción/rango de fechas + paginación), restringido a admin
- Frontend: página `/auditoria` (`AuditPage`) con filtros por entidad y fechas, item de menú "Auditoría" en Administración; `auditService` + hook `useAudit`

Cierra la Fase 13. La captura es automática vía middleware, sin tocar la lógica de los módulos.

---

## 2026-07-12 — Fase 11C: reporte de inventario (cierra Fase 11)

**Agregado:**

- Backend: `GET /reports/inventory` — valorización actual del stock (unidades, valor a costo Σ stock×costo, valor a venta Σ stock×precio, productos bajo stock), movimientos del período agrupados por tipo (cantidad + unidades netas) y top productos por valor en stock. Sin cambios de schema
- Frontend: pestaña "Inventario" en `ReportsPage` (`InventoryReportTab`), `reportService.getInventory` + hook `useInventoryReport`

Con esto se cierra la Fase 11 (Reportes: ventas, compras, caja, inventario). **Ganancias/margen quedó descartado** por decisión del proyecto (requería snapshot de costo en la venta).

---

## 2026-07-12 — Fase 12C: sucursales (registro/CRUD)

**Agregado:**

- Modelo `Branch` (nombre, dirección, teléfono, activo) + migración `20260712202258_sucursales`
- Backend: módulo `branches` en `/api/branches` (CRUD), restringido a admin vía `authorize('admin')`
- Frontend: pestaña "Sucursales" en `ConfigPage` con `BranchesSection` (tabla + borrado con confirmación) y `BranchFormModal` (RHF+Zod); `branchService` + hook `useBranches`

Registro de sucursales como configuración. El stock por sucursal y las transferencias de inventario quedan como epic futuro (requieren re-arquitectura mono→multi sucursal).

---

## 2026-07-12 — Fase 12A: configuración (empresa + usuarios)

**Agregado:**

- Modelo `Company` (fila única: nombre, dirección, CUIT, teléfono, pie de ticket) + migración `20260712195519_configuracion`
- Middleware `authorize(...roles)`: autorización por rol (además de `authenticate`)
- Backend: módulo `settings` (`GET /settings/company` para cualquier usuario; `PUT` solo admin) y módulo `users` (CRUD con roles, hash bcrypt, activar/desactivar, reset de contraseña) — todo `users` restringido a admin. No se exponen hashes de contraseña
- Frontend: `ConfigPage` (`/configuracion`) con pestañas Empresa / Usuarios: `CompanySection` (form RHF+Zod), `UsersSection` (tabla + `UserFormModal`). Services `settingsService`/`userService` y hooks `useCompany`/`useUsers`/`useRoles`
- El `Ticket` ahora toma los datos del negocio desde `useCompany` (fallback al placeholder mientras carga)

Primer corte de la Fase 12. Sucursales, impuestos e impresoras quedan pendientes.

---

## 2026-07-12 — Fase 11B: reportes de compras y caja

**Agregado:**

- Backend: `GET /reports/purchases` (compras recibidas por fecha de recepción — total comprado, serie diaria, top proveedores, top productos) y `GET /reports/cash` (cierres de caja del período con esperado/contado/diferencia + totales de movimientos por tipo). Helpers `resolveRange` y `buildDailySeries` extraídos para reuso
- Frontend: `ReportsPage` reorganizada en pestañas (Ventas / Compras / Caja) con rango de fechas compartido; nuevos `SalesReportTab`, `PurchasesReportTab`, `CashReportTab`, `CashSessionsTable` y `KpiCard`. Gráfico `DailySalesChart` generalizado a `DailyTotalChart` (reutilizado en ventas y compras)
- Hooks `usePurchasesReport` y `useCashReport`; `reportService.getPurchases/getCash`

Sin cambios de schema.

---

## 2026-07-12 — Fase 11A: reporte de ventas + dashboard real

**Agregado:**

- Backend: módulo `reports` en `/api/reports` (sin cambios de schema). `GET /sales?from=&to=` devuelve KPIs (cantidad, facturación bruta, devoluciones, neto, ticket promedio), serie diaria, totales por método de pago y top 10 productos; `GET /dashboard` devuelve KPIs del día, serie mensual (año actual vs anterior) y últimas ventas
- Frontend: `reportService` + hook `useSalesReport`, y páginas en `pages/reports/` — `ReportsPage` (filtro por rango de fechas, KPIs, gráficos ApexCharts de serie diaria y método de pago, tabla de top productos)
- `useDashboard` ahora consume `/api/reports/dashboard` (reemplaza el mock); el dashboard muestra datos reales
- Ruta `/reportes` conectada (reemplaza el `PagePlaceholder`)

Primera etapa de reportes. Compras, caja, inventario y ganancias quedan pendientes (ganancias requiere snapshot de costo en la venta).

---

## 2026-07-12 — Fase 10 completa: inventario (kardex + ajustes)

**Agregado:**

- Modelo `InventoryMovement` + enum `InventoryMovementType` (PURCHASE/SALE/SALE_CANCEL/RETURN/ADJUSTMENT) en Prisma, con `stockAfter` (snapshot) y motivo + migración `20260712185805_inventario`
- Backend: módulo `inventory` en `/api/inventory` — `GET /` (kardex con filtros por producto/tipo y paginación) y `POST /adjustments` (ajuste manual entrada/salida/conteo, transaccional). Helper `recordInventoryMovement` reutilizable
- Retrofit del kardex: `purchase.service.receive`, `sale.service.create/cancel/createReturn` ahora registran su movimiento de inventario dentro de sus transacciones (recepción, venta, anulación, devolución). `receive`/`cancel` reciben `userId`
- Frontend: `inventoryService` + hook `useInventory`, y páginas en `pages/inventory/` — `InventoryPage` (kardex con filtros), `MovementsTable`, `AdjustmentModal` (entrada/salida/conteo con vista previa del stock resultante) y `MovementTypeChip`
- Ruta `/inventario` conectada (reemplaza el `PagePlaceholder`)

Transferencias entre depósitos quedan diferidas a la Fase 12 (requieren sucursales).

---

## 2026-07-08 — Fase 9 completa: caja

**Agregado:**

- Modelos `CashSession` y `CashMovement` + enums `CashSessionStatus` (OPEN/CLOSED) y `CashMovementType` (SALE/RETURN/INCOME/EXPENSE) en Prisma + migración `20260708183728_caja`
- Backend: módulo `cash` (`cash.service.js`, `cash.controller.js`, `cash.routes.js`) en `/api/cash` — `open`, `close` (arqueo: esperado vs contado + diferencia), `addMovement` (ingreso/egreso), `current` (sesión abierta con balance calculado) y `sessions` (historial). Una sola caja abierta a la vez
- Integración con ventas: dentro de la transacción de la venta, si el pago es EFECTIVO y hay caja abierta se crea un movimiento `SALE`; anulaciones y devoluciones en efectivo crean un movimiento `RETURN` (egreso)
- Frontend: `cashService.js`, hook `useCash.js`, y `pages/cash/CashPage.jsx` con apertura, `SessionSummary` (KPIs), `MovementsTable`, `MovementFormModal` y `CloseSessionModal` (arqueo con diferencia en vivo)
- Ruta `/caja` conectada (reemplaza el `PagePlaceholder`)

Salda la deuda de integración de Ventas con Caja.

---

## 2026-07-08 — Fase 8C completa: devoluciones

**Agregado:**

- Modelos `SaleReturn` y `SaleReturnItem` en Prisma + estados `PARTIALLY_RETURNED` / `RETURNED` en el enum `SaleStatus` + migración `20260708182327_devoluciones`
- Backend: `saleService.createReturn()` (transaccional) valida el tope por ítem (vendido − ya devuelto), repone stock de lo devuelto, registra la devolución y recalcula el estado de la venta; `cancel()` ahora solo permite anular ventas `COMPLETED`. Endpoint `POST /api/sales/:id/return`. `findById` incluye las devoluciones
- Frontend: `ReturnFormModal` (selección de ítems y cantidades a devolver, motivo, monto a reintegrar), `SaleStatusChip` reutilizable (4 estados), botón "Devolución" y resumen de devoluciones en `SaleDetailModal`; `saleService.createReturn`

Cierra el módulo de Ventas (Fase 8). Anular (revierte venta completa) y Devolución (parcial/total con registro) conviven con semánticas distintas.

---

## 2026-07-06 — Fase 8B completa: impresión de ticket

**Agregado:**

- `pages/sales/components/Ticket.jsx` — comprobante reutilizable estilo 80mm (cabecera del negocio, ítems, subtotal/descuento/total, método de pago, marca de anulada) con `forwardRef`
- Hook `usePrintTicket.js` sobre `react-to-print` (v3), con `pageStyle` a 80mm
- Botón "Imprimir ticket" en `SaleDetailModal` (historial de ventas)
- Auto-impresión del ticket al confirmar una venta en el POS
- Constante `BUSINESS` en `constants/app.js` (nombre, dirección, CUIT, teléfono, pie) — placeholder hasta la Fase 12 (Configuración)

**Dependencias:**

- `react-to-print@3.3.0`

---

## 2026-07-06 — Fase 8A completa: POS core (ventas)

**Agregado:**

- Modelos `Sale` y `SaleItem` + enums `PaymentMethod` (EFECTIVO/TARJETA/TRANSFERENCIA) y `SaleStatus` (COMPLETED/CANCELLED) en Prisma, con relaciones a Customer/User/Product + migración `20260706181145_ventas`
- Backend: módulo `sales` (`sale.service.js`, `sale.controller.js`, `sale.routes.js`) en `/api/sales`. `create()` valida stock, calcula subtotal/descuento/total, crea la venta y descuenta stock en una transacción (bloquea si el stock es insuficiente); `cancel()` repone el stock también en transacción
- Frontend POS: `pages/pos/POSPage.jsx` (layout a 2 columnas) con `ProductSearchGrid`, `Cart` y `CheckoutPanel`, más el hook `useCart.js` (carrito con tope de stock) y `saleService.js`
- Frontend ventas: `pages/sales/SalesPage.jsx` (listado con filtro por estado y paginación), `SalesTable` y `SaleDetailModal` (detalle + anulación con reposición de stock); hook `useSales.js`
- Rutas `/ventas` (POS) y `/ventas/historial` (listado), e item de menú "Ventas" en el grupo Principal

Primera etapa (8A) del módulo central: el precio se trata como final (IVA incluido) y el pago es un método por venta; impresión de ticket (8B) y devoluciones (8C) quedan pendientes.

---

## 2026-07-06 — Fase 7 completa: módulo de compras

**Agregado:**

- Modelos `Purchase` y `PurchaseItem` + enum `PurchaseStatus` (PENDING/RECEIVED/CANCELLED) en Prisma, con relaciones a Supplier, User y Product + migración `20260706175017_compras`
- Backend: módulo `purchases` (`purchase.service.js`, `purchase.controller.js`, `purchase.routes.js`) en `/api/purchases`, con `receive()` y `cancel()`. La recepción sube el stock y actualiza el costo (último costo) de cada producto dentro de una transacción Prisma; edición/eliminación limitadas al estado pendiente
- Frontend: `purchaseService.js`, hook `usePurchases.js` (lista + detalle), y páginas en `pages/purchases/`: `PurchasesPage` (listado con filtro por estado, búsqueda y paginación) y `PurchaseFormPage` (páginas dedicadas `/compras/nueva` y `/compras/:id` para alta, edición de pendientes, vista de solo lectura y acciones recibir/cancelar/eliminar), con editor de renglones dinámico (`PurchaseItemsEditor` vía React Hook Form + `useFieldArray` + Zod)
- `utils/formatCurrency.js` — formateador de moneda reutilizable (ARS)
- Rutas `/compras`, `/compras/nueva` y `/compras/:id` conectadas (reemplazan el `PagePlaceholder`)

Primer módulo con lógica de negocio real (órdenes multi-ítem + actualización transaccional de stock), más allá del patrón CRUD.

---

## 2026-07-06 — Fase 6 completa: CRUD de proveedores

**Agregado:**

- Modelo `Supplier` en Prisma (razón social, email/documento únicos, teléfono, dirección, persona de contacto, `active`) + migración `20260706171148_proveedores`
- Backend: módulo `suppliers` (`supplier.service.js`, `supplier.controller.js`, `supplier.routes.js`) montado en `/api/suppliers` con autenticación JWT y validación de unicidad de email/documento
- Frontend: `supplierService.js`, hook `useSuppliers.js`, y páginas en `pages/suppliers/` (`SuppliersPage`, `SupplierTable`, `SupplierFormModal`) con búsqueda, paginación, alta/edición en modal (React Hook Form + Zod) y borrado con confirmación
- Ruta `/proveedores` conectada a `SuppliersPage` (reemplaza el `PagePlaceholder`)

Módulo espejo del CRUD de Clientes (Fase 5); se omitió el límite de crédito (no aplica) y se agregó persona de contacto.

---

## 2026-07-02 — Fase 1 completa: limpieza del template y arquitectura base

**Eliminado:**

- Páginas demo de Berry: `Color`, `Shadow`, `Typography`, `sample-page`
- `menu-items/pages.js`, `menu-items/other.js`, `menu-items/utilities.js`

**Agregado:**

- Navegación real del POS: 5 grupos (`Principal`, `Catálogo`, `Personas`, `Operaciones`, `Administración`) con 12 módulos y sus íconos Tabler
- `src/constants/app.js` — constantes del negocio (moneda ARS, timezone, rutas, paginación)
- `src/components/PagePlaceholder.jsx` — pantalla de módulo en construcción
- Rutas de todos los módulos POS con `PagePlaceholder` como página transitoria

**Reestructurado:**

- `src/layout/` → `src/layouts/`
- `src/themes/` → `src/theme/`
- `src/ui-component/` → `src/components/`
- `src/views/` → `src/pages/`
- `src/store/constant.js` → `src/constants/store.js`
- Todos los imports actualizados (30 archivos)

---

## 2026-06-29 — Setup inicial del monorepo

**Agregado:**

- Repositorio git inicializado.
- Estructura monorepo: contenido del template Berry MUI movido de `Berry-MUI-1.0.0/` a `frontend/`; carpeta `backend/` creada (placeholder, sin implementar).
- Documentación base: `ROADMAP.md`, `ARCHITECTURE.md`, `CHANGELOG.md`.
- `.gitignore` raíz para el monorepo.

**Cambiado:**

- Gestor de paquetes del frontend migrado de yarn a pnpm (`packageManager` en `frontend/package.json`). Se eliminaron `yarn.lock`, `.yarnrc.yml` y `package-lock.json`.

**Corregido:**

- `prop-types` se usaba en 28 archivos del template (ej. `src/contexts/ConfigContext.jsx`) sin estar declarado en `package.json`. Con yarn (resolución hoisted) pasaba desapercibido; pnpm lo bloquea por dependencia fantasma. Se agregó como dependencia directa.

**Verificación:**

- `pnpm install`, `pnpm exec vite build` y `pnpm exec vite` (dev server) corridos con éxito tras el reordenamiento de carpetas y el cambio de gestor de paquetes.

**Archivos principales:**

- `frontend/` (movido completo)
- `backend/README.md`
- `.gitignore`
- `ROADMAP.md`, `ARCHITECTURE.md`, `CHANGELOG.md`
- `frontend/package.json`
