import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiClock, FiVideo, FiUser, FiUsers, FiActivity, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';

const DoctorDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [selectedTab, setSelectedTab] = useState('today');

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['doctorAppointments', currentUser?.uid],
    queryFn: async () => {
      try {
        if (!currentUser?.uid) return [];
        
        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef,
          where('doctorId', '==', currentUser.uid),
          orderBy('dateTime', 'asc'),
          limit(20)
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
        patientId: '101',
        patientName: 'John Smith',
        patientAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        status: 'confirmed',
        type: 'in-person',
        notes: 'Annual checkup',
        reason: 'Regular checkup and blood pressure monitoring'
      },
      {
        id: '2',
        patientId: '102',
        patientName: 'Emily Johnson',
        patientAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        dateTime: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
        status: 'confirmed',
        type: 'video',
        notes: 'Follow-up consultation',
        reason: 'Discuss test results and medication adjustment'
      },
      {
        id: '3',
        patientId: '103',
        patientName: 'Michael Brown',
        patientAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        dateTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
        status: 'confirmed',
        type: 'in-person',
        notes: 'New patient',
        reason: 'Chest pain and shortness of breath'
      },
      {
        id: '4',
        patientId: '104',
        patientName: 'Sarah Williams',
        patientAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
        dateTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        status: 'confirmed',
        type: 'in-person',
        notes: '',
        reason: 'Routine checkup'
      },
      {
        id: '5',
        patientId: '105',
        patientName: 'David Miller',
        patientAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        dateTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        status: 'pending',
        type: 'video',
        notes: '',
        reason: 'Medication review'
      }
    ]
  });

  // Fetch patients
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['doctorPatients', currentUser?.uid],
    queryFn: async () => {
      try {
        if (!currentUser?.uid) return [];
        
        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef,
          where('doctorId', '==', currentUser.uid),
          orderBy('dateTime', 'desc'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        const appointments = querySnapshot.docs.map(doc => doc.data());
        
        // Extract unique patients from appointments
        const uniquePatients = [];
        const patientIds = new Set();
        
        appointments.forEach(appointment => {
          if (!patientIds.has(appointment.patientId)) {
            patientIds.add(appointment.patientId);
            uniquePatients.push({
              id: appointment.patientId,
              name: appointment.patientName,
              avatar: appointment.patientAvatar,
              lastVisit: appointment.dateTime
            });
          }
        });
        
        return uniquePatients;
      } catch (err) {
        console.error('Error fetching patients:', err);
        return [];
      }
    },
    // For demo purposes, use placeholder data if Firebase isn't set up
    placeholderData: [
      {
        id: '101',
        name: 'John Smith',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        lastVisit: new Date().toISOString(),
        age: 45,
        gender: 'Male',
        condition: 'Hypertension'
      },
      {
        id: '102',
        name: 'Emily Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        lastVisit: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        age: 32,
        gender: 'Female',
        condition: 'Anxiety'
      },
      {
        id: '103',
        name: 'Michael Brown',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        lastVisit: new Date().toISOString(),
        age: 58,
        gender: 'Male',
        condition: 'Coronary artery disease'
      },
      {
        id: '104',
        name: 'Sarah Williams',
        avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
        lastVisit: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        age: 29,
        gender: 'Female',
        condition: 'Asthma'
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

  // Check if date is today
  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Filter appointments based on selected tab
  const filteredAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (selectedTab === 'today') {
      return isToday(appointmentDate);
    } else if (selectedTab === 'upcoming') {
      return appointmentDate > today;
    } else if (selectedTab === 'pending') {
      return appointment.status === 'pending';
    }
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome, {userProfile?.displayName || 'Doctor'}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your appointments, patients, and practice information.
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Appointments</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {appointments?.filter(a => isToday(a.dateTime)).length || 0}
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
              <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Patients</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {patients?.length || 0}
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">98%</p>
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
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appointments</h2>
            <Link
              to="/dashboard/appointments"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setSelectedTab('today')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                selectedTab === 'today'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                selectedTab === 'upcoming'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                selectedTab === 'pending'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Pending Approval
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
                {selectedTab === 'today' 
                  ? "You don't have any appointments scheduled for today." 
                  : selectedTab === 'upcoming'
                  ? "You don't have any upcoming appointments."
                  : "You don't have any pending appointment requests."}
              </p>
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
                          src={appointment.patientAvatar}
                          alt={appointment.patientName}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          {appointment.patientName}
                        </h3>
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
                      
                      <div className="mt-3 flex space-x-2">
                        {appointment.status === 'pending' ? (
                          <>
                            <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                              <FiCheck className="mr-1.5 h-4 w-4" />
                              Approve
                            </button>
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                              <FiX className="mr-1.5 h-4 w-4" />
                              Decline
                            </button>
                          </>
                        ) : (
                          <>
                            {appointment.type === 'video' && isToday(appointment.dateTime) && (
                              <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                Start Session
                              </button>
                            )}
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                              View Details
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {appointment.reason && (
                    <div className="px-4 md:px-6 py-3 bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-500 dark:text-gray-400">
                      <strong>Reason:</strong> {appointment.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Patients section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Patients</h2>
          <Link
            to="/dashboard/patients"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            View all
          </Link>
        </div>

        <div className="p-6">
          {patientsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : patients?.length === 0 ? (
            <div className="text-center py-8">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No patients</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You haven't seen any patients yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Condition
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {patients?.slice(0, 5).map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={patient.avatar} alt={patient.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {patient.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.age} / {patient.gender}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.condition}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(patient.lastVisit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Reminders */}
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
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Reminder</h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
              <p>You have 2 patient records that need to be updated. Please complete them before the end of the day.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorDashboard;
