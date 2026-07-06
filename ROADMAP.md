# ROADMAP — POS Ventas

Estado general: **Fase 1 y Fase 2 completas. Fase 3 (Dashboard) es la siguiente.**

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

- [ ] KPIs
- [ ] Gráficos
- [ ] Actividad reciente
- [ ] Indicadores

## Fase 4 — Productos

- [ ] CRUD
- [ ] Categorías
- [ ] Marcas
- [ ] Stock
- [ ] Imágenes
- [ ] Código de barras

## Fase 5 — Clientes

- [ ] CRUD
- [ ] Historial
- [ ] Crédito
- [ ] Estadísticas

## Fase 6 — Proveedores

- [ ] CRUD completo

## Fase 7 — Compras

- [ ] Órdenes
- [ ] Recepción
- [ ] Actualización automática del stock

## Fase 8 — Ventas (módulo principal)

- [ ] POS
- [ ] Carrito
- [ ] Descuentos
- [ ] Impuestos
- [ ] Múltiples métodos de pago
- [ ] Impresión de ticket
- [ ] Devoluciones

## Fase 9 — Caja

- [ ] Apertura
- [ ] Cierre
- [ ] Arqueo
- [ ] Movimientos

## Fase 10 — Inventario

- [ ] Entradas
- [ ] Salidas
- [ ] Ajustes
- [ ] Transferencias

## Fase 11 — Reportes

- [ ] Ventas
- [ ] Compras
- [ ] Caja
- [ ] Ganancias
- [ ] Inventario

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

Ninguna por ahora.

## Bugs conocidos

Ninguno reportado todavía.

## Ideas futuras

- Docker para desarrollo y despliegue
- WebSocket para actualizaciones en tiempo real (caja, stock)
- Integración con impresoras térmicas
- Integración con lectores de código de barras
