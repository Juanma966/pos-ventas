import { RouterProvider } from 'react-router-dom';
import { SWRConfig } from 'swr';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layouts/NavigationScroll';

import ThemeCustomization from 'theme';

// auth provider

// Configuración global de SWR: menos requests redundantes y navegación sin parpadeo.
const swrConfig = {
  revalidateOnFocus: false, // no re-fetchear al volver a la pestaña
  dedupingInterval: 5000, // deduplica requests iguales dentro de 5s
  keepPreviousData: true, // conserva los datos previos mientras carga (paginación/filtros fluidos)
  errorRetryCount: 2
};

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <NavigationScroll>
        <SWRConfig value={swrConfig}>
          <RouterProvider router={router} />
        </SWRConfig>
      </NavigationScroll>
    </ThemeCustomization>
  );
}
