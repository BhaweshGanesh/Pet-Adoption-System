import { Navigate } from 'react-router-dom';
import { validateSession, getCurrentUser, getUserRole, logout } from '../utils/auth';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and/or specific roles
 * Includes session validation to ensure token hasn't expired
 * 
 * @param {ReactNode} children - The component to render if authorized
 * @param {Array<string>} allowedRoles - Array of roles that can access this route
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 */
const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  console.log('[ProtectedRoute] Checking access', { allowedRoles, requireAuth });
  
  // If authentication is required, validate session
  if (requireAuth) {
    // Check if session is valid (token exists and not expired)
    const isSessionValid = validateSession();
    
    if (!isSessionValid) {
      // Session invalid or expired, redirect to login
      console.log('[ProtectedRoute] ❌ Session invalid, redirecting to login');
      return <Navigate to="/login" replace />;
    }
  }

  // If specific roles are required, check user role
  if (allowedRoles.length > 0) {
    const user = getCurrentUser();
    
    if (!user) {
      // No user data found, redirect to login
      console.log('[ProtectedRoute] ❌ No user data, redirecting to login');
      return <Navigate to="/login" replace />;
    }

    const userRole = getUserRole();
    console.log('[ProtectedRoute] User role:', userRole, '| Allowed roles:', allowedRoles);

    // Check if user's role is in the allowed roles (case-insensitive comparison)
    const normalizedUserRole = userRole?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      console.log('[ProtectedRoute] ❌ User role not in allowed roles, redirecting based on role...');
      // Redirect based on user's actual role
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

  // User is authorized, render the children
  return children;
};

export default ProtectedRoute;
