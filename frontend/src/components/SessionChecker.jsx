import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateSession, isAuthenticated } from '../utils/auth';

const SessionChecker = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    const isValid = validateSession();
    if (!isValid && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }

    const intervalId = setInterval(() => {
      if (isAuthenticated()) {
        const isValid = validateSession();
        if (!isValid && location.pathname !== '/login') {
          alert('Your session has expired. Please login again.');
          navigate('/login', { replace: true });
        }
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [navigate, location.pathname]);

  return null;
};

export default SessionChecker;
