import { IconReportAnalytics, IconSettings, IconHistory } from '@tabler/icons-react';

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
      id: 'configuracion',
      title: 'Configuración',
      type: 'item',
      url: '/configuracion',
      icon: IconSettings,
      breadcrumbs: false
    },
    {
      id: 'auditoria',
      title: 'Auditoría',
      type: 'item',
      url: '/auditoria',
      icon: IconHistory,
      breadcrumbs: false
    }
  ]
};

export default administracion;
