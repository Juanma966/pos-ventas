import { IconReportAnalytics, IconSettings, IconReceipt2 } from '@tabler/icons-react';
import { ADMIN_ONLY } from 'constants/permissions';

const administracion = {
  id: 'administracion',
  title: 'Administración',
  type: 'group',
  // Todo el grupo es solo para administradores.
  children: [
    {
      id: 'reportes',
      title: 'Reportes',
      type: 'item',
      url: '/reportes',
      icon: IconReportAnalytics,
      breadcrumbs: false,
      roles: ADMIN_ONLY
    },
    {
      id: 'gastos-fijos',
      title: 'Gastos Fijos',
      type: 'item',
      url: '/gastos-fijos',
      icon: IconReceipt2,
      breadcrumbs: false,
      roles: ADMIN_ONLY
    },
    {
      id: 'configuracion',
      title: 'Configuración',
      type: 'item',
      url: '/configuracion',
      icon: IconSettings,
      breadcrumbs: false,
      roles: ADMIN_ONLY
    }
  ]
};

export default administracion;
