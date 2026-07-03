import { IconShoppingBag, IconWallet, IconClipboardList } from '@tabler/icons-react';

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
      breadcrumbs: false
    },
    {
      id: 'caja',
      title: 'Caja',
      type: 'item',
      url: '/caja',
      icon: IconWallet,
      breadcrumbs: false
    },
    {
      id: 'inventario',
      title: 'Inventario',
      type: 'item',
      url: '/inventario',
      icon: IconClipboardList,
      breadcrumbs: false
    }
  ]
};

export default operaciones;
