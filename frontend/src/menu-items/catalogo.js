import { IconPackage, IconCategory, IconTag } from '@tabler/icons-react';

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
      breadcrumbs: false
    },
    {
      id: 'marcas',
      title: 'Marcas',
      type: 'item',
      url: '/marcas',
      icon: IconTag,
      breadcrumbs: false
    }
  ]
};

export default catalogo;
