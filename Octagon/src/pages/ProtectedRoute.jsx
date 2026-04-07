import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Need to install jwt-decode

const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    // User not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    // Check if token is expired
    const isExpired = decodedToken.exp * 1000 < Date.now();
    if (isExpired) {
        localStorage.removeItem('token');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(userRole)) {
      // User does not have the required role
      // Redirect them to a generic page or show an 'Access Denied' message
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    // Invalid token
    localStorage.removeItem('token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;