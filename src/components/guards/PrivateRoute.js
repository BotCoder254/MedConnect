import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // User is not authenticated, redirect to login
    return <Navigate to="/auth/login" replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default PrivateRoute;
