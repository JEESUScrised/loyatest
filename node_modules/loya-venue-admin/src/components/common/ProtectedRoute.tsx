import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import LoadingSpinner from './LoadingSpinner';
import LoginForm from '../auth/LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  fallback 
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  // Показываем загрузку
  if (isLoading) {
    return <LoadingSpinner /> as React.ReactElement;
  }

  // Если не авторизован
  if (!isAuthenticated || !user) {
    return (fallback || (
      <div className="container">
        <div className="card">
          <LoginForm />
        </div>
      </div>
    )) as React.ReactElement;
  }

  // Если требуется определенная роль
  if (requiredRole && !hasRole(requiredRole)) {
    return (fallback || (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-purple-800">Недостаточно прав</h2>
          <p className="text-purple-600">
            У вас нет прав для доступа к этой странице
          </p>
        </div>
      </div>
    )) as React.ReactElement;
  }

  return <>{children}</> as React.ReactElement;
};

export default ProtectedRoute;
