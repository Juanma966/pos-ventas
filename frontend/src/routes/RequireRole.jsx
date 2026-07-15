import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import { canAccess } from 'constants/permissions';

// Protege una ruta según el rol. Si no tiene acceso, redirige al dashboard.
export default function RequireRole({ roles, children }) {
  const { user } = useAuth();
  if (!canAccess(user?.role, roles)) return <Navigate to="/dashboard" replace />;
  return children;
}

RequireRole.propTypes = {
  roles: PropTypes.array,
  children: PropTypes.node
};
