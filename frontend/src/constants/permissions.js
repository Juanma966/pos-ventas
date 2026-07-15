// Permisos por rol (espejo de la matriz enforced en el backend, ver
// backend/src/config/roles.js). Se usa para filtrar menú, proteger rutas y
// ocultar botones según el rol del usuario.
export const ROLES = {
  ADMIN: 'admin',
  CAJERO: 'cajero',
  VENDEDOR: 'vendedor'
};

// Conjuntos reutilizables
export const ALL_ROLES = [ROLES.ADMIN, ROLES.CAJERO, ROLES.VENDEDOR];
export const CASH_ROLES = [ROLES.ADMIN, ROLES.CAJERO];
export const ADMIN_ONLY = [ROLES.ADMIN];

// ¿El rol tiene acceso? Sin lista de roles => visible para todos.
export function canAccess(role, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}
