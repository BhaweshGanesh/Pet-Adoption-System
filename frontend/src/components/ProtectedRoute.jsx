import { Navigate } from 'react-router-dom';
import { validateSession, getCurrentUser, getUserRole } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  console.log('[ProtectedRoute] Checking access', { allowedRoles, requireAuth });

  if (requireAuth) {
    const isSessionValid = validateSession();

    if (!isSessionValid) {
      console.log('[ProtectedRoute] ❌ Session invalid, redirecting to login');
      return <Navigate to="/login" replace />;
    }
  }

  if (allowedRoles.length > 0) {
    const user = getCurrentUser();

    if (!user) {
      console.log('[ProtectedRoute] ❌ No user data, redirecting to login');
      return <Navigate to="/login" replace />;
    }

    const userRole = getUserRole();
    console.log('[ProtectedRoute] User role:', userRole, '| Allowed roles:', allowedRoles);

    const normalizedUserRole = userRole?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      console.log('[ProtectedRoute] ❌ User role not in allowed roles, redirecting based on role...');
      if (normalizedUserRole === 'admin') {
        console.log('[ProtectedRoute] → Redirecting to /admin-dashboard');
        return <Navigate to="/admin-dashboard" replace />;
      } else if (normalizedUserRole === 'staff') {
        console.log('[ProtectedRoute] → Redirecting to /staff-dashboard');
        return <Navigate to="/staff-dashboard" replace />;
      } else {
        console.log('[ProtectedRoute] → Redirecting to /browse-pets');
        return <Navigate to="/browse-pets" replace />;
      }
    }

    console.log('[ProtectedRoute] ✓ User authorized, rendering protected content');
  }

  return children;
};

export default ProtectedRoute;
