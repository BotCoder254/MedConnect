import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Close modal with escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Determine modal width based on size prop
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          />
          
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Modal panel */}
            <div className="inline-block align-bottom sm:align-middle w-full text-left transform transition-all sm:my-8">
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden mx-auto ${sizeClasses[size]}`}
              >
                {/* Header */}
                {title && (
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {title}
                    </h3>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                )}
                
                {/* Body */}
                <div className={!title ? 'pt-5' : ''}>
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
