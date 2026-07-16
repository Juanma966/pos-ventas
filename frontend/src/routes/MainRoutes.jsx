import { lazy } from 'react';

import MainLayout from 'layouts/MainLayout';
import Loadable from 'components/Loadable';
import ProtectedRoute from './ProtectedRoute';
import RequireRole from './RequireRole';
import { ADMIN_ONLY, CASH_ROLES } from 'constants/permissions';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/Default')));
const ProductsPage = Loadable(lazy(() => import('pages/products/ProductsPage')));
const CategoriesPage = Loadable(lazy(() => import('pages/categories/CategoriesPage')));
const BrandsPage = Loadable(lazy(() => import('pages/brands/BrandsPage')));
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
    {
      path: 'categorias',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <CategoriesPage />
        </RequireRole>
      )
    },
    {
      path: 'marcas',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <BrandsPage />
        </RequireRole>
      )
    },

    { path: 'clientes', element: <CustomersPage /> },
    {
      path: 'proveedores',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <SuppliersPage />
        </RequireRole>
      )
    },
    {
      path: 'personal',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <EmployeesPage />
        </RequireRole>
      )
    },

    {
      path: 'compras',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <PurchasesPage />
        </RequireRole>
      )
    },
    {
      path: 'compras/nueva',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <PurchaseFormPage />
        </RequireRole>
      )
    },
    {
      path: 'compras/:id',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <PurchaseFormPage />
        </RequireRole>
      )
    },
    {
      path: 'caja',
      element: (
        <RequireRole roles={CASH_ROLES}>
          <CashPage />
        </RequireRole>
      )
    },
    {
      path: 'inventario',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <InventoryPage />
        </RequireRole>
      )
    },

    {
      path: 'reportes',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <ReportsPage />
        </RequireRole>
      )
    },
    {
      path: 'configuracion',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <ConfigPage />
        </RequireRole>
      )
    },
    {
      path: 'gastos-fijos',
      element: (
        <RequireRole roles={ADMIN_ONLY}>
          <ExpensesPage />
        </RequireRole>
      )
    }
  ]
};

export default MainRoutes;
