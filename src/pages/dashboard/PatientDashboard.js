import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiClock, FiVideo, FiUser, FiFileText, FiActivity, FiAlertCircle } from 'react-icons/fi';

const PatientDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [selectedTab, setSelectedTab] = useState('upcoming');

  // Fetch upcoming appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['patientAppointments', currentUser?.uid],
    queryFn: async () => {
      try {
        if (!currentUser?.uid) return [];
        
        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef,
          where('patientId', '==', currentUser.uid),
          orderBy('dateTime', 'asc'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        console.error('Error fetching appointments:', err);
        return [];
      }
    },
    // For demo purposes, use placeholder data if Firebase isn't set up
    placeholderData: [
      {
        id: '1',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        doctorSpecialty: 'Cardiology',
        doctorAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        dateTime: '2023-07-15T10:00:00',
        status: 'confirmed',
        type: 'in-person',
        notes: 'Annual heart checkup',
        location: '123 Medical Plaza, Suite 456, New York, NY 10001'
      },
      {
        id: '2',
        doctorId: '5',
        doctorName: 'Dr. Lisa Patel',
        doctorSpecialty: 'Psychiatry',
        doctorAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
        dateTime: '2023-07-18T14:30:00',
        status: 'confirmed',
        type: 'video',
        notes: 'Follow-up consultation'
      }
    ]
  });

  // Fetch medical records
  const { data: medicalRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['patientRecords', currentUser?.uid],
    queryFn: async () => {
      try {
        if (!currentUser?.uid) return [];
        
        const recordsRef = collection(db, 'medicalRecords');
        const q = query(
          recordsRef,
          where('patientId', '==', currentUser.uid),
          orderBy('date', 'desc'),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        console.error('Error fetching medical records:', err);
        return [];
      }
    },
    // For demo purposes, use placeholder data if Firebase isn't set up
    placeholderData: [
      {
        id: '1',
        doctorName: 'Dr. Sarah Johnson',
        doctorSpecialty: 'Cardiology',
        date: '2023-06-10T09:30:00',
        type: 'Examination',
        diagnosis: 'Mild hypertension',
        treatment: 'Prescribed Lisinopril 10mg daily',
        notes: 'Follow-up in 3 months'
      },
      {
        id: '2',
        doctorName: 'Dr. Michael Chen',
        doctorSpecialty: 'Dermatology',
        date: '2023-05-22T11:00:00',
        type: 'Consultation',
        diagnosis: 'Eczema',
        treatment: 'Prescribed topical corticosteroid cream',
        notes: 'Apply twice daily for two weeks'
      }
    ]
  });

  // Format date for appointments
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Format time for appointments
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Filter appointments based on selected tab
  const filteredAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.dateTime);
    const now = new Date();
    
    if (selectedTab === 'upcoming') {
      return appointmentDate >= now;
    } else if (selectedTab === 'past') {
      return appointmentDate < now;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome, {userProfile?.displayName || 'Patient'}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your appointments, medical records, and health information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900/30 rounded-full p-3">
              <FiCalendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Appointments</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {appointments?.filter(a => new Date(a.dateTime) >= new Date()).length || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
              <FiFileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Medical Records</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {medicalRecords?.length || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-full p-3">
              <FiActivity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Health Status</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">Good</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Appointments section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8"
      >
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Appointments</h2>
            <Link
              to="/dashboard/appointments"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          <div className="flex">
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`px-6 py-3 text-sm font-medium ${
                selectedTab === 'upcoming'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setSelectedTab('past')}
              className={`px-6 py-3 text-sm font-medium ${
                selectedTab === 'past'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        <div className="p-6">
          {appointmentsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredAppointments?.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No appointments</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {selectedTab === 'upcoming' 
                  ? "You don't have any upcoming appointments." 
                  : "You don't have any past appointments."}
              </p>
              {selectedTab === 'upcoming' && (
                <div className="mt-6">
                  <Link
                    to="/doctors"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Find a Doctor
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments?.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <img
                          className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          src={appointment.doctorAvatar}
                          alt={appointment.doctorName}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          {appointment.doctorName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {appointment.doctorSpecialty}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FiClock className="mr-1.5 h-4 w-4" />
                          <span>
                            {formatDate(appointment.dateTime)} at {formatTime(appointment.dateTime)}
                          </span>
                        </div>
                        {appointment.type === 'video' ? (
                          <div className="mt-1 flex items-center text-sm text-primary-600 dark:text-primary-400">
                            <FiVideo className="mr-1.5 h-4 w-4" />
                            <span>Video consultation</span>
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiUser className="mr-1.5 h-4 w-4" />
                            <span>In-person visit</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      {selectedTab === 'upcoming' && (
                        <div className="mt-3 flex space-x-2">
                          {appointment.type === 'video' && new Date(appointment.dateTime) <= new Date(Date.now() + 15 * 60 * 1000) && (
                            <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                              Join Now
                            </button>
                          )}
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Reschedule
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="px-4 md:px-6 py-3 bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-500 dark:text-gray-400">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Medical Records section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Medical Records</h2>
          <Link
            to="/dashboard/records"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            View all
          </Link>
        </div>

        <div className="p-6">
          {recordsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : medicalRecords?.length === 0 ? (
            <div className="text-center py-8">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No medical records</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You don't have any medical records yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalRecords?.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          {record.type}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {record.doctorName} - {record.doctorSpecialty}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {record.diagnosis && (
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Diagnosis:</span>{' '}
                          <span className="text-gray-600 dark:text-gray-300">{record.diagnosis}</span>
                        </div>
                      )}
                      
                      {record.treatment && (
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Treatment:</span>{' '}
                          <span className="text-gray-600 dark:text-gray-300">{record.treatment}</span>
                        </div>
                      )}
                      
                      {record.notes && (
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Notes:</span>{' '}
                          <span className="text-gray-600 dark:text-gray-300">{record.notes}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                        View full record
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Health reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Health Reminder</h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
              <p>Your annual physical checkup is due next month. Schedule an appointment with your primary care physician.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientDashboard;
