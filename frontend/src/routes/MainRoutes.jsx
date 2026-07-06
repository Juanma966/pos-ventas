import { lazy } from 'react';

import MainLayout from 'layouts/MainLayout';
import Loadable from 'components/Loadable';
import PagePlaceholder from 'components/PagePlaceholder';
import ProtectedRoute from './ProtectedRoute';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/Default')));
const ProductsPage = Loadable(lazy(() => import('pages/products/ProductsPage')));
const CustomersPage = Loadable(lazy(() => import('pages/customers/CustomersPage')));
const SuppliersPage = Loadable(lazy(() => import('pages/suppliers/SuppliersPage')));

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <DashboardDefault /> },
    { path: 'dashboard', element: <DashboardDefault /> },

    { path: 'ventas', element: <PagePlaceholder title="Punto de Venta" /> },

    { path: 'productos', element: <ProductsPage /> },
    { path: 'categorias', element: <PagePlaceholder title="Categorías" /> },
    { path: 'marcas', element: <PagePlaceholder title="Marcas" /> },

    { path: 'clientes', element: <CustomersPage /> },
    { path: 'proveedores', element: <SuppliersPage /> },

    { path: 'compras', element: <PagePlaceholder title="Compras" /> },
    { path: 'caja', element: <PagePlaceholder title="Caja" /> },
    { path: 'inventario', element: <PagePlaceholder title="Inventario" /> },

    { path: 'reportes', element: <PagePlaceholder title="Reportes" /> },
    { path: 'configuracion', element: <PagePlaceholder title="Configuración" /> }
  ]
};

export default MainRoutes;
