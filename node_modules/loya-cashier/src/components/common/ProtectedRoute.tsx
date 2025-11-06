import React, { ReactNode, ReactElement } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  fallback 
}): ReactElement => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  // Показываем загрузку
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Если не авторизован
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-green-800">Требуется авторизация</h2>
          <p className="text-green-600">Пожалуйста, войдите в систему</p>
        </div>
      </div>
    );
  }

  // Если требуется определенная роль
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-green-800">Недостаточно прав</h2>
          <p className="text-green-600">
            У вас нет прав для доступа к этой странице
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
