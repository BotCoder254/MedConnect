import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return setError('Please enter your email address');
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email for password reset instructions');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please check if the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Reset your password</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Enter your email and we'll send you instructions to reset your password
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md mb-6 flex items-start"
        >
          <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-md mb-6 flex items-start"
        >
          <FiCheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Reset password'
              )}
            </motion.button>
          </div>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your password?{' '}
        <Link
          to="/auth/login"
          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
