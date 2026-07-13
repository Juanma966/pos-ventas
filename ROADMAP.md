# ROADMAP — POS Ventas

Estado general: **Fases 1 a 11 y 14 completas. Fase 12 parcial (falta Impresoras). Fase 13 (Auditoría) removida. En curso: nuevos módulos Gastos Fijos y Personal.**

## Fase 1 — Base del proyecto

- [x] Inicializar repositorio git (monorepo)
- [x] Separar `frontend/` y `backend/`
- [x] Documentación base (`ROADMAP.md`, `ARCHITECTURE.md`, `CHANGELOG.md`)
- [x] Limpieza del contenido demo del template Berry (Dashboard genérico, sample-page, Color/Shadow/Typography)
- [x] Definir navegación real del POS (menu-items)
- [x] Reestructurar carpetas del frontend según convención objetivo (`api/`, `components/`, `features/`, `layouts/`, `pages/`, `hooks/`, `services/`, `contexts/`, `routes/`, `theme/`, `utils/`, `constants/`, `assets/`)
- [x] Configuración base (variables de entorno, constantes del negocio)

## Fase 2 — Autenticación

- [x] Bootstrap del backend (Express + Prisma + PostgreSQL)
- [x] Login (JWT access token + refresh token con rotación)
- [x] Logout
- [x] Refresh Token
- [x] Roles (admin, cajero, vendedor)
- [ ] Permisos granulares (Fase futura)

## Fase 3 — Dashboard

- [x] KPIs (Ventas hoy, Transacciones, Bajo stock, Clientes nuevos)
- [x] Gráfico de ventas por mes (comparación año actual vs anterior)
- [x] Actividad reciente (últimas ventas del día)
- [x] Hook useDashboard (mock, listo para conectar a API)

## Fase 4 — Productos

- [x] CRUD completo (crear, editar, eliminar)
- [x] Categorías (CRUD backend + selector en formulario)
- [x] Marcas (CRUD backend + selector en formulario)
- [x] Stock con alerta de bajo stock
- [x] Código de barras
- [x] Búsqueda y paginación
- [ ] Imágenes (pendiente)

## Fase 5 — Clientes

- [x] CRUD completo (crear, editar, eliminar)
- [x] Campos: nombre, email, teléfono, documento, dirección, notas
- [x] Límite de crédito
- [x] Búsqueda y paginación
- [ ] Historial de compras (requiere Fase 8 — Ventas)
- [ ] Estadísticas por cliente (requiere Fase 8 — Ventas)

## Fase 6 — Proveedores

- [x] CRUD completo (crear, editar, eliminar)
- [x] Campos: razón social, CUIT/CUIL, email, teléfono, persona de contacto, dirección
- [x] Búsqueda y paginación

## Fase 7 — Compras

- [x] Órdenes de compra con múltiples renglones (proveedor + productos)
- [x] Estados: pendiente / recibida / cancelada
- [x] Recepción con actualización automática de stock y costo (último costo) en transacción
- [x] Edición/eliminación solo en estado pendiente; cancelación sin efecto en stock
- [x] Listado con filtro por estado, búsqueda por proveedor y paginación
- [ ] Reversión de stock al cancelar una compra ya recibida (mejora futura)

## Fase 8 — Ventas (módulo principal)

### 8A — POS core (completo)

- [x] Pantalla POS: buscador + grilla de productos y carrito
- [x] Carrito con control de cantidad (tope = stock disponible)
- [x] Descuento a nivel de venta
- [x] Método de pago (efectivo / tarjeta / transferencia, uno por venta)
- [x] Cliente opcional (consumidor final por defecto)
- [x] Venta transaccional que descuenta stock; bloqueo si stock insuficiente
- [x] Listado de ventas con filtro por estado, detalle y anulación (repone stock)
- [x] Impuestos: precio tratado como final (IVA incluido); discriminación diferida a Fase 12

### 8B — Impresión de ticket (completo)

- [x] Componente `Ticket` reutilizable (comprobante estilo 80mm) con datos del negocio
- [x] Impresión vía `react-to-print` (hook `usePrintTicket`)
- [x] Botón "Imprimir ticket" en el detalle de venta (historial)
- [x] Auto-impresión al confirmar una venta en el POS
- [x] Datos del negocio en constante `BUSINESS` (placeholder hasta Fase 12 — Configuración)

### 8C — Devoluciones (completo)

- [x] Devolución parcial o total de una venta (por ítem y cantidad)
- [x] Tope por ítem = vendido − ya devuelto
- [x] Reposición de stock de lo devuelto en transacción
- [x] Estados nuevos `PARTIALLY_RETURNED` / `RETURNED` según lo devuelto
- [x] "Anular" limitado a ventas `COMPLETED`; convive con "Devolución"
- [x] Modal de devolución + resumen de devoluciones en el detalle de venta

### Pendiente de integración

- [ ] Múltiples métodos de pago (pago dividido) — mejora futura
- [x] Asociar venta a una caja abierta (resuelto en Fase 9 — Caja)

## Fase 9 — Caja

- [x] Apertura con monto inicial (una sola caja abierta a la vez)
- [x] Movimientos manuales (ingreso / egreso)
- [x] Ventas en efectivo registran movimiento automático en la caja abierta
- [x] Anulaciones y devoluciones en efectivo registran egreso automático
- [x] Cierre con arqueo (efectivo contado vs esperado + diferencia)
- [x] Pantalla de caja: apertura, resumen con KPIs, listado de movimientos, cierre

## Fase 10 — Inventario

- [x] Kardex: libro de movimientos de inventario por producto (con filtros por producto/tipo y paginación)
- [x] Ajustes manuales: entrada (+), salida (−) y ajuste por conteo (stock absoluto), con motivo
- [x] Registro automático de movimientos en compras (recepción), ventas, anulaciones y devoluciones
- [x] Snapshot de stock resultante (`stockAfter`) en cada movimiento
- [ ] Transferencias entre sucursales/depósitos (requiere Fase 12 — Configuración)

## Fase 11 — Reportes

### 11A — Ventas + Dashboard real (completo)

- [x] Reporte de ventas por rango de fechas: KPIs (ventas, facturación bruta, neto, ticket promedio), serie diaria, por método de pago, top productos
- [x] Dashboard conectado a datos reales de la API (reemplaza el mock)

### 11B — Compras + Caja (completo)

- [x] Reporte de compras (recibidas, por fecha de recepción): total comprado, serie diaria, top proveedores, top productos
- [x] Reporte de caja: cierres/arqueos del período (esperado vs contado, diferencia) + totales de movimientos por tipo
- [x] Pantalla de reportes reorganizada en pestañas (Ventas / Compras / Caja) con rango de fechas compartido

### 11C — Inventario (completo)

- [x] Reporte de inventario: valorización actual (unidades, valor a costo, valor a venta, bajo stock), movimientos del período por tipo y top productos por valor en stock
- [x] Pestaña "Inventario" en la pantalla de reportes

### Descartado

- ~~Ganancias / margen~~ — fuera de alcance por decisión del proyecto (requería snapshot de costo en la venta).

## Fase 12 — Configuración

### 12A — Empresa + Usuarios (completo)

- [x] Datos del negocio (nombre, dirección, CUIT, teléfono, pie de ticket) editables desde Configuración
- [x] Ticket conectado a los datos reales de la empresa (reemplaza el placeholder)
- [x] ABM de usuarios con rol (crear, editar, activar/desactivar, reset de contraseña) — hash bcrypt
- [x] Middleware `authorize('admin')`: Configuración y usuarios restringidos a admin (avance del pendiente de permisos)

### 12C — Sucursales (completo)

- [x] Registro de sucursales (CRUD): nombre, dirección, teléfono, activo — admin-only, en Configuración
- [ ] Stock por sucursal + transferencias (epic futuro — requiere re-arquitectura mono→multi sucursal)

### Pendientes

- [ ] Impresoras

### Descartado

- ~~Impuestos (alícuota IVA / IVA discriminado)~~ — fuera de alcance por decisión del proyecto. El precio se mantiene como final (IVA incluido).

## Fase 13 — Auditoría (removida)

- ~~Registro de acciones del sistema (middleware + `/auditoria`)~~ — **implementada y luego removida** por decisión del proyecto (no aporta valor para un POS de comercio). Se eliminó el módulo, middleware, pantalla y la tabla `AuditLog`.

## Fase 14 — Optimización (completa)

- [x] Lazy loading (rutas con `lazy()` + `Loadable`)
- [x] Cache: `SWRConfig` global (revalidateOnFocus off, deduping 5s, keepPreviousData, retry 2)
- [x] Code-splitting de vendors en Vite (`manualChunks`): chunk principal de la app 811 KB → 263 KB; react/mui/charts/forms en chunks propios cacheables

### Descartado

- ~~Optimización de consultas backend~~ — el volumen es chico; agregar en JS anda bien. Se revisará solo si el volumen crece.

## Fase 15 — Producción

- [ ] Seguridad
- [ ] Despliegue
- [ ] Docker
- [ ] Backups
- [ ] Monitoreo
- [ ] Documentación

---

## Módulos adicionales (fuera del roadmap original)

> Estado: Gastos Fijos y Personal completos.


### Gastos Fijos (completo)

- [x] ABM de gastos fijos mensuales (nombre, categoría alquiler/servicio/crédito/otro, monto, activo)
- [x] Endpoint de resumen (total mensual + desglose por categoría)
- [x] Página `/gastos-fijos` (item de menú en Administración) con total mensual
- [x] Widget en el dashboard (total + desglose por categoría)
- Sin integración con Caja (por decisión)

### Personal (completo)

- [x] Empleados (separados de Usuarios): nombre, puesto, sueldo, activo
- [x] Movimientos por empleado (adelanto / descuento / pago) con nota
- [x] Saldo tipo ledger continuo: "entregado neto" = adelantos + pagos − descuentos; sueldo como referencia
- [x] Página `/personal` (grupo Personas) con listado + detalle (ledger + alta/baja de movimientos)

---

## Pendientes / notas abiertas

- **Validación en backend:** los módulos validan solo con Zod en el frontend; falta middleware de validación en la API (deuda transversal a todos los módulos).
- **`formatCurrency` compartido:** se creó `utils/formatCurrency.js` y se usa en Compras; queda migrar los usos inline duplicados en Clientes, Productos y Dashboard.

## Bugs conocidos

Ninguno reportado todavía.

## Ideas futuras

- Docker para desarrollo y despliegue
- WebSocket para actualizaciones en tiempo real (caja, stock)
- Integración con impresoras térmicas
- Integración con lectores de código de barras
