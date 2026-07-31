import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { authState } = useContext(AuthContext);

  if (!authState.isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authState.role)) {
    // Redirect to unauthorized page if role doesn't match
    return <Navigate to="/unauthorized" replace />;
  }

  // Render matching dashboard layout if authorized
  return <Outlet />;
};

export default ProtectedRoute;
