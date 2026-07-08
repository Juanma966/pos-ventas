export const APP_NAME = 'POS Ventas';
export const APP_VERSION = '1.0.0';

// Datos del negocio para el ticket. Placeholder hasta la Fase 12 (Configuración),
// donde pasarán a administrarse desde la base de datos.
export const BUSINESS = {
  name: 'POS Ventas',
  address: 'Av. Siempre Viva 123, Buenos Aires',
  phone: '(011) 4000-0000',
  taxId: '30-00000000-0',
  footer: '¡Gracias por su compra!'
};

export const CURRENCY = {
  code: 'ARS',
  symbol: '$',
  locale: 'es-AR'
};

export const DATE_LOCALE = 'es-AR';
export const TIMEZONE = 'America/Argentina/Buenos_Aires';

export const PAGINATION_DEFAULT = 20;

export const ROUTES = {
  DASHBOARD: '/dashboard',
  VENTAS: '/ventas',
  PRODUCTOS: '/productos',
  CATEGORIAS: '/categorias',
  MARCAS: '/marcas',
  CLIENTES: '/clientes',
  PROVEEDORES: '/proveedores',
  COMPRAS: '/compras',
  CAJA: '/caja',
  INVENTARIO: '/inventario',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion',
  LOGIN: '/login'
};
