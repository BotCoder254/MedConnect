import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Layout components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import DoctorDirectory from './pages/DoctorDirectory';
import DoctorProfile from './pages/DoctorProfile';
import PatientDashboard from './pages/dashboard/PatientDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import Appointments from './pages/dashboard/Appointments';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Guards
import PrivateRoute from './components/guards/PrivateRoute';
import DoctorRoute from './components/guards/DoctorRoute';
import PatientRoute from './components/guards/PatientRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider value={{ user }}>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="doctors" element={<DoctorDirectory />} />
                <Route path="doctors/:id" element={<DoctorProfile />} />
              </Route>

              {/* Auth routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }>
                <Route path="patient" element={
                  <PatientRoute>
                    <PatientDashboard />
                  </PatientRoute>
                } />
                <Route path="doctor" element={
                  <DoctorRoute>
                    <DoctorDashboard />
                  </DoctorRoute>
                } />
                <Route path="appointments" element={<Appointments />} />
              </Route>

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
