import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { verifyToken, refreshToken } from '../../../shared/api/common';

const ProtectedRoute = ({ children }: any) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      const _refreshToken = localStorage.getItem('refreshToken');
      
      if (!token) {
        setIsValid(false);
        return;
      }

      try {
        const response = await verifyToken();
        if (response?.result === 'SUCCESS') {
          setIsValid(true);
          return;
        }

        if (response?.message === 'EXPIRED_OR_INVALID' && _refreshToken) {
          const newToken = await refreshToken();
          if (newToken.access_token) {
            localStorage.setItem('token', newToken.access_token);
            setIsValid(true);
            return;
          }
        }

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setIsValid(false);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setIsValid(false);
      }
    };

    checkToken();
  }, []);

  if (isValid === null) {
    return <div>認証確認中...</div>;
  }

  if (!isValid) {
    return <Navigate to="/teacher/login" replace />;
  }

  return children;
};

export default ProtectedRoute;