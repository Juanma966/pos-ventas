import { lazy } from 'react';

import MainLayout from 'layouts/MainLayout';
import Loadable from 'components/Loadable';
import PagePlaceholder from 'components/PagePlaceholder';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/Default')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    { path: '/', element: <DashboardDefault /> },
    { path: 'dashboard', element: <DashboardDefault /> },

    // Ventas
    { path: 'ventas', element: <PagePlaceholder title="Punto de Venta" /> },

    // Catálogo
    { path: 'productos', element: <PagePlaceholder title="Productos" /> },
    { path: 'categorias', element: <PagePlaceholder title="Categorías" /> },
    { path: 'marcas', element: <PagePlaceholder title="Marcas" /> },

    // Personas
    { path: 'clientes', element: <PagePlaceholder title="Clientes" /> },
    { path: 'proveedores', element: <PagePlaceholder title="Proveedores" /> },

    // Operaciones
    { path: 'compras', element: <PagePlaceholder title="Compras" /> },
    { path: 'caja', element: <PagePlaceholder title="Caja" /> },
    { path: 'inventario', element: <PagePlaceholder title="Inventario" /> },

    // Administración
    { path: 'reportes', element: <PagePlaceholder title="Reportes" /> },
    { path: 'configuracion', element: <PagePlaceholder title="Configuración" /> }
  ]
};

export default MainRoutes;
