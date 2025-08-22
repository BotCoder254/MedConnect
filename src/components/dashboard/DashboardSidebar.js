import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiCalendar, 
  FiUsers, 
  FiMessageSquare, 
  FiFileText, 
  FiSettings,
  FiHelpCircle,
  FiX,
  FiUser,
  FiChevronRight,
  FiChevronDown,
  FiMenu
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DashboardSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { userProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location, sidebarOpen, setSidebarOpen]);

  const isDoctor = userProfile?.role === 'doctor';

  const navigation = [
    { 
      name: 'Dashboard', 
      href: isDoctor ? '/dashboard/doctor' : '/dashboard/patient', 
      icon: FiHome,
      type: 'link'
    },
    {
      name: 'Appointments',
      icon: FiCalendar,
      type: 'category',
      items: [
        { name: 'All Appointments', href: '/dashboard/appointments' },
        { name: 'Upcoming', href: '/dashboard/appointments?filter=upcoming' },
        { name: 'Past', href: '/dashboard/appointments?filter=past' },
        { name: 'Cancelled', href: '/dashboard/appointments?filter=cancelled' }
      ]
    },
    { 
      name: 'Messages', 
      href: '/dashboard/messages', 
      icon: FiMessageSquare,
      type: 'link'
    },
    ...(isDoctor ? [
      {
        name: 'Patients',
        icon: FiUsers,
        type: 'category',
        items: [
          { name: 'All Patients', href: '/dashboard/patients' },
          { name: 'New Patients', href: '/dashboard/patients?filter=new' },
          { name: 'Regular Patients', href: '/dashboard/patients?filter=regular' }
        ]
      }
    ] : [
      {
        name: 'My Doctors',
        icon: FiUsers,
        type: 'category',
        items: [
          { name: 'All Doctors', href: '/dashboard/doctors' },
          { name: 'Primary Care', href: '/dashboard/doctors?filter=primary' },
          { name: 'Specialists', href: '/dashboard/doctors?filter=specialists' }
        ]
      }
    ]),
    {
      name: 'Medical Records',
      icon: FiFileText,
      type: 'category',
      items: [
        { name: 'All Records', href: '/dashboard/records' },
        { name: 'Test Results', href: '/dashboard/records?filter=tests' },
        { name: 'Prescriptions', href: '/dashboard/records?filter=prescriptions' },
        { name: 'Medical History', href: '/dashboard/records?filter=history' }
      ]
    },
    { 
      name: 'Profile', 
      href: '/dashboard/profile', 
      icon: FiUser,
      type: 'link'
    },
    { 
      name: 'Settings', 
      href: '/dashboard/settings', 
      icon: FiSettings,
      type: 'link'
    },
    { 
      name: 'Help', 
      href: '/dashboard/help', 
      icon: FiHelpCircle,
      type: 'link'
    }
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 lg:hidden transition-opacity ease-linear duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <motion.div
          className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out transform"
          initial={{ x: "-100%" }}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <FiX className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <SidebarContent navigation={navigation} />
        </motion.div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <SidebarContainer navigation={navigation} />
      </div>
    </>
  );
};

const SidebarContent = ({ navigation, initialCollapsed, onToggleCollapse }) => {
  const { userProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialCollapsed || false);
  
  // Sync collapsed state with parent component if provided
  useEffect(() => {
    if (initialCollapsed !== undefined) {
      setSidebarCollapsed(initialCollapsed);
    }
  }, [initialCollapsed]);
  
  // Notify parent component of collapse toggle if callback provided
  const handleCollapseToggle = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    if (onToggleCollapse) {
      onToggleCollapse(newState);
    }
  };
  
  // Check which categories should be expanded based on current route
  useEffect(() => {
    const newExpandedState = {};
    navigation.forEach(item => {
      if (item.type === 'category') {
        const shouldExpand = item.items.some(subItem => 
          location.pathname === subItem.href || 
          location.pathname + location.search === subItem.href
        );
        if (shouldExpand) {
          newExpandedState[item.name] = true;
        }
      }
    });
    setExpandedCategories(newExpandedState);
  }, [location.pathname, location.search, navigation]);

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };
  
  return (
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center justify-between flex-shrink-0 px-4 mb-5">
        {!sidebarCollapsed ? (
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">MedConnect</span>
        ) : (
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">MC</span>
        )}
        <button 
          onClick={handleCollapseToggle}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        >
          <FiMenu className="h-5 w-5" />
        </button>
      </div>
      
      {/* User info */}
      <div className="px-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userProfile?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userProfile?.role === 'doctor' ? 'Doctor' : 'Patient'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-2 flex-1 px-2 space-y-1">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.type === 'link' ? (
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                {!sidebarCollapsed && item.name}
              </NavLink>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => toggleCategory(item.name)}
                  className="group w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                    {!sidebarCollapsed && item.name}
                  </div>
                  {!sidebarCollapsed && (
                    expandedCategories[item.name] ? 
                      <FiChevronDown className="h-4 w-4 text-gray-500" /> : 
                      <FiChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                <AnimatePresence>
                  {(expandedCategories[item.name] && !sidebarCollapsed) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-10 space-y-1">
                        {item.items.map((subItem) => (
                          <NavLink
                            key={subItem.name}
                            to={subItem.href}
                            className={({ isActive }) =>
                              `group flex items-center px-2 py-2 text-xs font-medium rounded-md transition-colors ${
                                isActive
                                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                              }`
                            }
                          >
                            {subItem.name}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* Dark mode toggle */}
      <div className="px-4 mt-6 mb-8">
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          <span className={`p-1 rounded-full ${darkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-amber-100 text-amber-600'}`}>
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

const SidebarContainer = ({ navigation }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div 
      className="flex flex-col"
      initial={{ width: '16rem' }}
      animate={{ width: isCollapsed ? '4.5rem' : '16rem' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <SidebarContent 
          navigation={navigation} 
          initialCollapsed={isCollapsed}
          onToggleCollapse={setIsCollapsed}
        />
      </div>
    </motion.div>
  );
};

export default DashboardSidebar;
