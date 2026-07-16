# Appunti — Sistema POS

Sistema de punto de venta (POS) para comercios: ventas, caja, inventario,
compras, clientes, proveedores, reportes y más. Monorepo con backend de API REST
y frontend web.

## Stack

- **Frontend:** React + Vite + Material UI (Berry), React Router, SWR, React Hook Form + Zod, Axios.
- **Backend:** Node.js + Express, Prisma ORM, PostgreSQL, JWT (access + refresh), Zod.
- **Infra:** Docker + Docker Compose, nginx.

## Módulos

Autenticación y roles · Dashboard · Productos (categorías, marcas, stock, código de
barras) · Clientes · Proveedores · Compras · Ventas (POS, descuentos, ticket,
devoluciones) · Caja (apertura/cierre/arqueo) · Inventario (kardex, ajustes) ·
Reportes (ventas, compras, caja, inventario) · Configuración (empresa, usuarios,
sucursales) · Gastos fijos · Personal (empleados y adelantos).

## Estructura

```
backend/    API REST (Express + Prisma)
frontend/   Aplicación web (React + Vite)
scripts/    Operación (backup / restore de la base)
```

## Desarrollo local

Requisitos: Node 20, pnpm, Docker (para Postgres).

```bash
# Base de datos
cd backend && docker compose up -d

# Backend
pnpm install
cp .env.example .env        # ajustar DATABASE_URL / secretos
pnpm db:migrate
pnpm db:seed                # crea admin@pos.com / admin123
pnpm dev                    # API en http://localhost:4000

# Frontend (en otra terminal)
cd ../frontend
pnpm install
pnpm dev                    # app en http://localhost:3000
```

## Producción

Ver **[DEPLOY.md](DEPLOY.md)** para el despliegue con Docker en un VPS.

## Documentación

- [ROADMAP.md](ROADMAP.md) — estado y fases del proyecto.
- [ARCHITECTURE.md](ARCHITECTURE.md) — decisiones técnicas y estructura.
- [BACKEND.md](BACKEND.md) / [FRONTEND.md](FRONTEND.md) — guías para crear/modificar entidades y vistas.
- [TESTING.md](TESTING.md) — cómo están hechos los tests del backend y cómo escribir nuevos (`cd backend && pnpm test`).
- [CHANGELOG.md](CHANGELOG.md) — historial de cambios.
