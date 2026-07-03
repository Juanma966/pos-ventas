import { RouterProvider } from 'react-router-dom';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layouts/NavigationScroll';

import ThemeCustomization from 'theme';

// auth provider

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <NavigationScroll>
        <>
          <RouterProvider router={router} />
        </>
      </NavigationScroll>
    </ThemeCustomization>
  );
}
