
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

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

export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cart_') || key.startsWith('booking_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const validateSession = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  console.log('[validateSession] Checking session...', { hasToken: !!token, hasUser: !!user });

  if (!token || !user) {
    console.log('[validateSession] Missing token or user data');
    return false;
  }

  try {
    const userData = JSON.parse(user);
    console.log('[validateSession] User data:', {
      role: userData.role,
      fullName: userData.fullName,
      email: userData.email
    });

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

export const initSessionChecker = () => {
  validateSession();

  const intervalId = setInterval(() => {
    const isValid = validateSession();
    if (!isValid && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, 60000);

  return () => clearInterval(intervalId);
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const handleAuthError = (response) => {
  if (response.status === 401 || response.status === 403) {
    console.log('Authentication error, logging out...');
    logout();
    window.location.href = '/login';
    return true;
  }
  return false;
};
