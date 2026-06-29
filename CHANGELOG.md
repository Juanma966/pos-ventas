# CHANGELOG — POS Ventas

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
