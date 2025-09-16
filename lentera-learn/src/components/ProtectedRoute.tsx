import React from 'react';
import { Navigate } from 'react-router-dom';
import { useJwtApiClient } from '../services/apiClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const apiClient = useJwtApiClient();
  
  if (!apiClient.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;