import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import Loadable from 'components/Loadable';
import MinimalLayout from 'layouts/MinimalLayout';
import useAuth from 'hooks/useAuth';
import Loader from 'components/Loader';

const LoginPage = Loadable(lazy(() => import('pages/authentication/Login')));

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/login',
      element: (
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      )
    }
  ]
};

export default AuthenticationRoutes;
