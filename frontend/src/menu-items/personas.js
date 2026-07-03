import { IconUsers, IconTruck } from '@tabler/icons-react';

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
      breadcrumbs: false
    }
  ]
};

export default personas;
