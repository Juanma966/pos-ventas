# CHANGELOG — POS Ventas

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
