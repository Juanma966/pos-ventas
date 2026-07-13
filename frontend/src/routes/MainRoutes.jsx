import { lazy } from 'react';

import MainLayout from 'layouts/MainLayout';
import Loadable from 'components/Loadable';
import PagePlaceholder from 'components/PagePlaceholder';
import ProtectedRoute from './ProtectedRoute';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/Default')));
const ProductsPage = Loadable(lazy(() => import('pages/products/ProductsPage')));
const CustomersPage = Loadable(lazy(() => import('pages/customers/CustomersPage')));
const SuppliersPage = Loadable(lazy(() => import('pages/suppliers/SuppliersPage')));
const PurchasesPage = Loadable(lazy(() => import('pages/purchases/PurchasesPage')));
const PurchaseFormPage = Loadable(lazy(() => import('pages/purchases/PurchaseFormPage')));
const POSPage = Loadable(lazy(() => import('pages/pos/POSPage')));
const SalesPage = Loadable(lazy(() => import('pages/sales/SalesPage')));
const InventoryPage = Loadable(lazy(() => import('pages/inventory/InventoryPage')));
const ReportsPage = Loadable(lazy(() => import('pages/reports/ReportsPage')));
const ConfigPage = Loadable(lazy(() => import('pages/config/ConfigPage')));
const ExpensesPage = Loadable(lazy(() => import('pages/expenses/ExpensesPage')));
const EmployeesPage = Loadable(lazy(() => import('pages/employees/EmployeesPage')));
const CashPage = Loadable(lazy(() => import('pages/cash/CashPage')));

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

    { path: 'ventas', element: <POSPage /> },
    { path: 'ventas/historial', element: <SalesPage /> },

    { path: 'productos', element: <ProductsPage /> },
    { path: 'categorias', element: <PagePlaceholder title="Categorías" /> },
    { path: 'marcas', element: <PagePlaceholder title="Marcas" /> },

    { path: 'clientes', element: <CustomersPage /> },
    { path: 'proveedores', element: <SuppliersPage /> },
    { path: 'personal', element: <EmployeesPage /> },

    { path: 'compras', element: <PurchasesPage /> },
    { path: 'compras/nueva', element: <PurchaseFormPage /> },
    { path: 'compras/:id', element: <PurchaseFormPage /> },
    { path: 'caja', element: <CashPage /> },
    { path: 'inventario', element: <InventoryPage /> },

    { path: 'reportes', element: <ReportsPage /> },
    { path: 'configuracion', element: <ConfigPage /> },
    { path: 'gastos-fijos', element: <ExpensesPage /> }
  ]
};

export default MainRoutes;
