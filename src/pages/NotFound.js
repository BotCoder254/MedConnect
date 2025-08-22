import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-primary-500 dark:text-primary-400">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiHome className="mr-2 -ml-1 h-4 w-4" />
              Go to Homepage
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiArrowLeft className="mr-2 -ml-1 h-4 w-4" />
              Go Back
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
