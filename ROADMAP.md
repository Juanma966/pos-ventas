# ROADMAP — POS Ventas

Estado general: **Fases 1 a 10 completas. Fase 11 (Reportes) en progreso: 11A (ventas + dashboard real) completo.**

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

### Pendientes

- [ ] Reporte de compras
- [ ] Reporte de caja
- [ ] Reporte de inventario
- [ ] Ganancias / margen (requiere snapshot de costo en la venta — ver Fase 8)

## Fase 12 — Configuración

- [ ] Empresa
- [ ] Sucursales
- [ ] Impuestos
- [ ] Impresoras
- [ ] Usuarios

## Fase 13 — Auditoría

- [ ] Registro completo de acciones del sistema

## Fase 14 — Optimización

- [ ] Rendimiento
- [ ] Lazy loading
- [ ] Cache
- [ ] Optimización de consultas

## Fase 15 — Producción

- [ ] Seguridad
- [ ] Despliegue
- [ ] Docker
- [ ] Backups
- [ ] Monitoreo
- [ ] Documentación

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
