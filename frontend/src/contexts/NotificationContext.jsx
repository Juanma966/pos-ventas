import PropTypes from 'prop-types';
import { createContext, useCallback, useMemo, useState } from 'react';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export const NotificationContext = createContext(null);

// Provider global de notificaciones (toasts). Uso:
//   const { notify } = useNotification();
//   notify.success('Producto creado');  notify.error('No se pudo eliminar');
export function NotificationProvider({ children }) {
  const [toast, setToast] = useState(null); // { key, message, severity }

  const show = useCallback((message, severity) => {
    // key nuevo por toast: si llega otro mensaje, reemplaza al anterior
    setToast({ key: Date.now(), message, severity });
  }, []);

  const notify = useMemo(
    () => ({
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      warning: (message) => show(message, 'warning'),
      info: (message) => show(message, 'info')
    }),
    [show]
  );

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return;
    setToast(null);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={toast?.severity ?? 'info'} variant="filled" sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = { children: PropTypes.node };
