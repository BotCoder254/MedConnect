import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCalendar, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { cancelAppointment } from '../../services/ScheduleService';
import { formatDate, formatTime } from '../../models/ScheduleModels';

const CancelAppointment = ({ appointment, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const queryClient = useQueryClient();
  
  // Calculate if the appointment is within 24 hours
  const isWithin24Hours = () => {
    const appointmentDate = new Date(appointment.start);
    const now = new Date();
    const diffInHours = (appointmentDate - now) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };
  
  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: ({ appointmentId, reason, userId }) => 
      cancelAppointment(appointmentId, reason, userId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['patientAppointments']);
      queryClient.invalidateQueries(['doctorAppointments']);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Error cancelling appointment:', error);
      alert('There was an error cancelling your appointment. Please try again.');
    }
  });
  
  // Handle appointment cancellation
  const handleCancel = () => {
    if (!currentUser) return;
    
    cancelMutation.mutate({
      appointmentId: appointment.id,
      reason: reason || 'No reason provided',
      userId: currentUser.uid
    });
  };
  
  // Format appointment date for display
  const appointmentDate = new Date(appointment.start);
  const formattedDate = formatDate(appointmentDate);
  const formattedTime = formatTime(appointmentDate);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-4">
        <h3 className="text-xl font-semibold">Cancel Appointment</h3>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {cancelMutation.isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <FiCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Appointment Cancelled
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Your appointment for {formattedDate} at {formattedTime} has been successfully cancelled.
            </p>
            <button
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Close
            </button>
          </motion.div>
        ) : isConfirming ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500/50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Are you sure you want to cancel this appointment?
                    </p>
                    {isWithin24Hours() && (
                      <p className="text-sm font-medium text-red-700 dark:text-red-400 mt-1">
                        Warning: This appointment is within 24 hours. Cancellation fees may apply.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {cancelMutation.isLoading ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Appointment Details
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <FiCalendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formattedDate}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formattedTime}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Appointment Type</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {appointment.type === 'telemedicine' ? 'Video Visit' : 'In-Person Visit'}
                  </p>
                </div>
                
                {appointment.reason && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Visit</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {appointment.reason}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Reason for cancellation */}
              <div className="mb-6">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Cancellation (optional)
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                  placeholder="Please provide a reason for cancelling this appointment"
                ></textarea>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isWithin24Hours() ? (
                    <span className="text-red-500">
                      This appointment is within 24 hours of the scheduled time. Cancellation fees may apply according to our cancellation policy.
                    </span>
                  ) : (
                    'You can cancel this appointment without any fees as it is more than 24 hours before the scheduled time.'
                  )}
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Go Back
                </button>
                <button
                  onClick={() => setIsConfirming(true)}
                  className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CancelAppointment;
