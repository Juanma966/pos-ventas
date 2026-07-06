# CHANGELOG — POS Ventas

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
