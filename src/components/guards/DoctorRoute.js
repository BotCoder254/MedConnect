import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DoctorRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    // User is not authenticated, redirect to login
    return <Navigate to="/auth/login" replace />;
  }

  if (userProfile?.role !== 'doctor') {
    // User is not a doctor, redirect to patient dashboard
    return <Navigate to="/dashboard/patient" replace />;
  }

  // User is authenticated and is a doctor, render the protected component
  return children;
};

export default DoctorRoute;
