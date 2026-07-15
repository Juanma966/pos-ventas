import { IconUsers, IconTruck, IconUserCog } from '@tabler/icons-react';
import { ADMIN_ONLY } from 'constants/permissions';

const personas = {
  id: 'personas',
  title: 'Personas',
  type: 'group',
  children: [
    {
      id: 'clientes',
      title: 'Clientes',
      type: 'item',
      url: '/clientes',
      icon: IconUsers,
      breadcrumbs: false
    },
    {
      id: 'proveedores',
      title: 'Proveedores',
      type: 'item',
      url: '/proveedores',
      icon: IconTruck,
      breadcrumbs: false,
      roles: ADMIN_ONLY
    },
    {
      id: 'personal',
      title: 'Personal',
      type: 'item',
      url: '/personal',
      icon: IconUserCog,
      breadcrumbs: false,
      roles: ADMIN_ONLY
    }
  ]
};

export default personas;
