import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar, FiEdit, FiXCircle, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const AppointmentHistory = ({ appointmentId }) => {
  const [events, setEvents] = useState([]);
  
  // Fetch appointment history
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['appointmentHistory', appointmentId],
    queryFn: async () => {
      try {
        const historyRef = collection(db, `appointments/${appointmentId}/events`);
        const q = query(historyRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
      } catch (error) {
        console.error('Error fetching appointment history:', error);
        throw error;
      }
    },
    enabled: !!appointmentId
  });
  
  useEffect(() => {
    if (historyData) {
      setEvents(historyData);
    }
  }, [historyData]);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Get icon based on event type
  const getEventIcon = (event) => {
    switch (event.status) {
      case 'requested':
        return <FiCalendar className="h-5 w-5 text-blue-500" />;
      case 'confirmed':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'rescheduled':
        return <FiEdit className="h-5 w-5 text-orange-500" />;
      case 'cancelled':
        return <FiXCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get event title based on event type
  const getEventTitle = (event) => {
    switch (event.status) {
      case 'requested':
        return 'Appointment Requested';
      case 'confirmed':
        return 'Appointment Confirmed';
      case 'rescheduled':
        return 'Appointment Rescheduled';
      case 'cancelled':
        return 'Appointment Cancelled';
      case 'completed':
        return 'Appointment Completed';
      default:
        return 'Status Updated';
    }
  };
  
  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading appointment history...</p>
      </div>
    );
  }
  
  if (!events || events.length === 0) {
    return (
      <div className="py-4 text-center">
        <FiAlertCircle className="h-6 w-6 text-gray-400 mx-auto" />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No history available for this appointment.</p>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appointment History</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {events.map((event, eventIdx) => (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 ? (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  />
                ) : null}
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: eventIdx * 0.1, duration: 0.3 }}
                  className="relative flex items-start space-x-3"
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                      {getEventIcon(event)}
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getEventTitle(event)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                      </p>
                    </div>
                    
                    {event.note && (
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>{event.note}</p>
                      </div>
                    )}
                    
                    {event.status === 'rescheduled' && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <p>
                          From: {formatDate(event.oldStart)} at {formatTime(event.oldStart)}
                          <br />
                          To: {formatDate(event.newStart)} at {formatTime(event.newStart)}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AppointmentHistory;
