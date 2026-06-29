# ARCHITECTURE — POS Ventas

## Estructura del repositorio (monorepo)

```
POS-Ventas/
├── frontend/     # React + Vite + Material UI (basado en template Berry MUI)
├── backend/      # Node + Express + Prisma + PostgreSQL (pendiente de bootstrap)
├── CLAUDE.md
├── ROADMAP.md
├── ARCHITECTURE.md
└── CHANGELOG.md
```

**Decisión:** monorepo con `frontend/` y `backend/` como paquetes independientes (cada uno con su propio `package.json`, dependencias y lockfile), versionados en un único repositorio git.

**Por qué:** el proyecto recién empieza y todavía no hay equipos separados ni necesidad de releases independientes. Un solo repo simplifica el setup inicial y facilita coordinar cambios de API y UI en el mismo commit/PR durante esta etapa temprana. Se puede separar en repos distintos más adelante si el proyecto crece y lo justifica.

## Gestor de paquetes

El frontend usa **pnpm** (`packageManager: "pnpm@10.34.4"` en `frontend/package.json`). El template original venía configurado con yarn; se migró a pnpm para alinear con la herramienta que usa el desarrollador. Se eliminaron `yarn.lock`, `.yarnrc.yml` y `package-lock.json`; el lockfile válido es `pnpm-lock.yaml`.

## Arquitectura Frontend (estado actual)

El frontend es, por ahora, el template **Berry MUI 1.0.0** sin modificar funcionalmente (solo movido de carpeta). Estructura actual dentro de `frontend/src/`:

```
src/
├── api/
├── assets/
├── contexts/
├── hooks/
├── layout/
├── menu-items/
├── routes/
├── store/
├── themes/
├── ui-component/
└── views/
```

**Estructura objetivo** (definida en `CLAUDE.md`, a migrar progresivamente durante la Fase 1):

```
src/
├── api/
├── components/
├── features/
├── layouts/
├── pages/
├── hooks/
├── services/
├── contexts/
├── routes/
├── theme/
├── utils/
├── constants/
└── assets/
```

Pendiente: limpiar el contenido demo (`views/dashboard/Default`, `views/sample-page`, `views/utilities/{Color,Shadow,Typography}`) y reorganizar `views/` → `pages/` + `features/`, `layout/` → `layouts/`, `ui-component/` → `components/`, `themes/` → `theme/`.

## Arquitectura Backend (planeada, no implementada)

- Node.js + Express
- Prisma ORM + PostgreSQL
- Autenticación con JWT (access + refresh token)
- API REST, organizada por recursos (auth, users, products, sales, etc.)

Se implementa recién en la Fase 2 (Autenticación), porque es la primera funcionalidad que necesita un backend real.

## Flujo de autenticación

Pendiente de diseño — se documenta cuando se implemente la Fase 2.

## Convenciones del proyecto

- **Componentes:** `PascalCase.jsx` (ej. `ProductCard.jsx`, `CustomerTable.jsx`)
- **Páginas:** `PascalCase` + sufijo `Page` (ej. `ProductsPage.jsx`)
- **Servicios:** `camelCase` + sufijo `Service` (ej. `productService.js`)
- **Hooks:** `camelCase` con prefijo `use` (ej. `useProducts.js`)
- **Utilidades:** `camelCase` descriptivo (ej. `formatCurrency.js`)
- Toda llamada HTTP pasa por `services/`, nunca directo desde componentes.
- Toda lógica reutilizable se extrae a hooks.
- Formularios: React Hook Form + Zod, con validación en frontend y backend.

## Decisiones importantes

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-06-29 | Monorepo `frontend/` + `backend/` en un solo repo git | Simplicidad en etapa inicial del proyecto, sin necesidad aún de releases independientes |
| 2026-06-29 | Migrar de yarn a pnpm en el frontend | Alineado con el gestor de paquetes que usa el desarrollador |
| 2026-06-29 | Bootstrap del backend diferido a la Fase 2 | Es la primera fase que requiere backend real (login); evita crear estructura vacía sin uso inmediato |
