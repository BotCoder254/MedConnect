import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';

const DashboardLayout = () => {
  const { currentUser, userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect to appropriate dashboard based on role
  if (userProfile && !window.location.pathname.includes('/dashboard/')) {
    const redirectPath = userProfile.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
