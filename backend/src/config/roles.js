// Roles del sistema y conjuntos reutilizables según la matriz de permisos.
// Fuente única para aplicar `authorize(...)` en las rutas.
export const ROLES = {
  ADMIN: 'admin',
  CAJERO: 'cajero',
  VENDEDOR: 'vendedor',
};

// Todos los roles (venta / lectura general).
export const ALL_ROLES = [ROLES.ADMIN, ROLES.CAJERO, ROLES.VENDEDOR];

// Caja y operaciones sobre ventas ya hechas (anular / devolver).
export const CASH_ROLES = [ROLES.ADMIN, ROLES.CAJERO];

// Solo administración.
export const ADMIN_ONLY = [ROLES.ADMIN];
