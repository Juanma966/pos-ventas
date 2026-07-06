import { IconLayoutDashboard, IconShoppingCart, IconReceipt } from '@tabler/icons-react';

const principal = {
  id: 'principal',
  title: 'Principal',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: IconLayoutDashboard,
      breadcrumbs: false
    },
    {
      id: 'ventas',
      title: 'Punto de Venta',
      type: 'item',
      url: '/ventas',
      icon: IconShoppingCart,
      breadcrumbs: false
    },
    {
      id: 'historial-ventas',
      title: 'Ventas',
      type: 'item',
      url: '/ventas/historial',
      icon: IconReceipt,
      breadcrumbs: false
    }
  ]
};

export default principal;
