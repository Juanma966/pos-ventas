import { IconPackage, IconCategory, IconTag } from '@tabler/icons-react';
import { ADMIN_ONLY } from 'constants/permissions';

const catalogo = {
  id: 'catalogo',
  title: 'Catálogo',
  type: 'group',
  children: [
    {
      id: 'productos',
      title: 'Productos',
      type: 'item',
      url: '/productos',
      icon: IconPackage,
      breadcrumbs: false
    },
    {
      id: 'categorias',
      title: 'Categorías',
      type: 'item',
      url: '/categorias',
      icon: IconCategory,
      breadcrumbs: false,
      roles: ADMIN_ONLY
    },
    {
      id: 'marcas',
      title: 'Marcas',
      type: 'item',
      url: '/marcas',
      icon: IconTag,
      breadcrumbs: false,
      roles: ADMIN_ONLY
    }
  ]
};

export default catalogo;
