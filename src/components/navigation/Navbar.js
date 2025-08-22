import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiMoon, FiSun, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navbarClasses = `fixed w-full z-30 transition-all duration-300 ${
    scrolled || isOpen
      ? 'bg-white dark:bg-gray-900 shadow-md py-2'
      : 'bg-transparent py-4'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  MedConnect
                </span>
              </motion.div>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink to="/" label="Home" />
              <NavLink to="/doctors" label="Find Doctors" />
              <NavLink to="/about" label="About" />
              <NavLink to="/contact" label="Contact" />
            </div>
          </div>

          {/* Secondary nav - auth, theme toggle */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {currentUser ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiUser className="mr-2" />
                Dashboard
              </Link>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 mr-2"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-white dark:bg-gray-900 shadow-lg"
          >
            <div className="pt-2 pb-4 space-y-1">
              <MobileNavLink to="/" label="Home" />
              <MobileNavLink to="/doctors" label="Find Doctors" />
              <MobileNavLink to="/about" label="About" />
              <MobileNavLink to="/contact" label="Contact" />
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1 px-4">
                {currentUser ? (
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/auth/register"
                      className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
        isActive
          ? 'border-primary-500 text-gray-900 dark:text-white'
          : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      {label}
    </Link>
  );
};

const MobileNavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label}
    </Link>
  );
};

export default Navbar;
