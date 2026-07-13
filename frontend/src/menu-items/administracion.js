import { IconReportAnalytics, IconSettings, IconReceipt2 } from '@tabler/icons-react';

const administracion = {
  id: 'administracion',
  title: 'Administración',
  type: 'group',
  children: [
    {
      id: 'reportes',
      title: 'Reportes',
      type: 'item',
      url: '/reportes',
      icon: IconReportAnalytics,
      breadcrumbs: false
    },
    {
      id: 'gastos-fijos',
      title: 'Gastos Fijos',
      type: 'item',
      url: '/gastos-fijos',
      icon: IconReceipt2,
      breadcrumbs: false
    },
    {
      id: 'configuracion',
      title: 'Configuración',
      type: 'item',
      url: '/configuracion',
      icon: IconSettings,
      breadcrumbs: false
    }
  ]
};

export default administracion;
