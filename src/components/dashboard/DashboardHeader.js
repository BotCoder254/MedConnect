import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DashboardHeader = ({ setSidebarOpen }) => {
  const { currentUser, logout, userProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden -ml-2 p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <FiMenu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="hidden lg:block lg:ml-2">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {userProfile?.role === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center">
            {/* Notifications dropdown */}
            <div className="relative mr-4" ref={notificationsRef}>
              <button
                type="button"
                className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <FiBell className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800"></span>
                </div>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <NotificationItem
                        title="Appointment Confirmed"
                        description="Your appointment with Dr. Smith has been confirmed for tomorrow at 2:00 PM."
                        time="1 hour ago"
                        isNew
                      />
                      <NotificationItem
                        title="New Message"
                        description="You have a new message from Dr. Johnson regarding your last visit."
                        time="3 hours ago"
                      />
                      <NotificationItem
                        title="Reminder"
                        description="Don't forget your appointment with Dr. Davis tomorrow at 10:00 AM."
                        time="1 day ago"
                      />
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <Link
                        to="/dashboard/notifications"
                        className="block px-4 py-2 text-sm text-center text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  {currentUser?.displayName?.charAt(0) || <FiUser />}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                  {currentUser?.displayName || 'User'}
                </span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentUser?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <FiUser className="mr-2 h-4 w-4" />
                      Your Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <FiSettings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <FiLogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const NotificationItem = ({ title, description, time, isNew }) => {
  return (
    <div className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${isNew ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isNew ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
            <FiBell className="h-4 w-4" />
          </div>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
            {isNew && (
              <span className="ml-2 text-xs font-medium text-primary-500 dark:text-primary-400">
                New
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
