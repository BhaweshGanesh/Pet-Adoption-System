import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateSession, isAuthenticated } from '../utils/auth';

/**
 * SessionChecker Component
 * Runs in the background to periodically check session validity
 * Automatically logs out user if session expires
 */
const SessionChecker = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check session if user is authenticated
    if (!isAuthenticated()) {
      return;
    }

    // Check session immediately on mount
    const isValid = validateSession();
    if (!isValid && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }

    // Set up interval to check session every minute
    const intervalId = setInterval(() => {
      if (isAuthenticated()) {
        const isValid = validateSession();
        if (!isValid && location.pathname !== '/login') {
          alert('Your session has expired. Please login again.');
          navigate('/login', { replace: true });
        }
      }
    }, 60000); // Check every 60 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [navigate, location.pathname]);

  // This component doesn't render anything
  return null;
};

export default SessionChecker;
