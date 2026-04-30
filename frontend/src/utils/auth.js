// Authentication and Session Utilities

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token and user data
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get current user data
 * @returns {object|null} User object or null if not found
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get current user role
 * @returns {string|null} User role or null if not found
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

/**
 * Check if user has any of the specified roles
 * @param {Array<string>} roles - Roles to check
 * @returns {boolean} True if user has any of the roles
 */
export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

/**
 * Logout user and clear all data
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Clear any other stored data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cart_') || key.startsWith('booking_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Validate session by checking if token exists and is not expired
 * Note: This is a basic client-side check. 
 * The backend should also validate the token on each request.
 * @returns {boolean} True if session appears valid
 */
export const validateSession = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('[validateSession] Checking session...', { hasToken: !!token, hasUser: !!user });
  
  if (!token || !user) {
    console.log('[validateSession] Missing token or user data');
    return false;
  }

  try {
    // Parse user data to check role
    const userData = JSON.parse(user);
    console.log('[validateSession] User data:', {
      role: userData.role,
      fullName: userData.fullName,
      email: userData.email
    });
    
    // Decode JWT token to check expiry (basic check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp && payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      console.log('[validateSession] Session expired, logging out...');
      logout();
      return false;
    }
    
    console.log('[validateSession] ✓ Session valid for user role:', userData.role);
    return true;
  } catch (error) {
    console.error('[validateSession] Error validating session:', error);
    
    return false;
  }
};

/**
 * Initialize session checker that runs periodically
 * Checks session every minute and logs out if expired
 */
export const initSessionChecker = () => {
  // Check session immediately
  validateSession();
  
  // Check every minute
  const intervalId = setInterval(() => {
    const isValid = validateSession();
    if (!isValid && window.location.pathname !== '/login') {
      // Session invalid, redirect to login
      window.location.href = '/login';
    }
  }, 60000); // Check every 60 seconds
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

/**
 * Get authentication header for API requests
 * @returns {object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Handle API authentication errors
 * @param {Response} response - Fetch API response
 * @returns {boolean} True if auth error was handled
 */
export const handleAuthError = (response) => {
  if (response.status === 401 || response.status === 403) {
    console.log('Authentication error, logging out...');
    logout();
    window.location.href = '/login';
    return true;
  }
  return false;
};
