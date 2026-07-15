import { IconShoppingBag, IconWallet, IconClipboardList } from '@tabler/icons-react';
import { ADMIN_ONLY, CASH_ROLES } from 'constants/permissions';

const operaciones = {
  id: 'operaciones',
  title: 'Operaciones',
  type: 'group',
  children: [
    {
      id: 'compras',
      title: 'Compras',
      type: 'item',
      url: '/compras',
      icon: IconShoppingBag,
      breadcrumbs: false,
      roles: ADMIN_ONLY
    },
    {
      id: 'caja',
      title: 'Caja',
      type: 'item',
      url: '/caja',
      icon: IconWallet,
      breadcrumbs: false,
      roles: CASH_ROLES
    },
    {
      id: 'inventario',
      title: 'Inventario',
      type: 'item',
      url: '/inventario',
      icon: IconClipboardList,
      breadcrumbs: false,
      roles: ADMIN_ONLY
    }
  ]
};

export default operaciones;
