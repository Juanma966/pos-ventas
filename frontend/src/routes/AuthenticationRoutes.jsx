import { lazy } from 'react';

import Loadable from 'components/Loadable';
import MinimalLayout from 'layouts/MinimalLayout';

const LoginPage = Loadable(lazy(() => import('pages/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('pages/authentication/Register')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> }
  ]
};

export default AuthenticationRoutes;
