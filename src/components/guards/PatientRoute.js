import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PatientRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    // User is not authenticated, redirect to login
    return <Navigate to="/auth/login" replace />;
  }

  if (userProfile?.role !== 'patient') {
    // User is not a patient, redirect to doctor dashboard
    return <Navigate to="/dashboard/doctor" replace />;
  }

  // User is authenticated and is a patient, render the protected component
  return children;
};

export default PatientRoute;
