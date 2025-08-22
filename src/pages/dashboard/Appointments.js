import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiClock, FiVideo, FiUser, FiMapPin, FiFilter, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const Appointments = () => {
  const { currentUser, userProfile } = useAuth();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', currentUser?.uid, userProfile?.role],
    queryFn: async () => {
      try {
        if (!currentUser?.uid) return [];
        
        const appointmentsRef = collection(db, 'appointments');
        const fieldToQuery = userProfile?.role === 'doctor' ? 'doctorId' : 'patientId';
        
        const q = query(
          appointmentsRef,
          where(fieldToQuery, '==', currentUser.uid),
          orderBy('dateTime', 'asc')
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
    placeholderData: userProfile?.role === 'doctor' ? [
      {
        id: '1',
        patientId: '101',
        patientName: 'John Smith',
        patientAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        status: 'confirmed',
        type: 'in-person',
        notes: 'Annual checkup',
        reason: 'Regular checkup and blood pressure monitoring',
        location: '123 Medical Plaza, Suite 456, New York, NY 10001'
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
        reason: 'Chest pain and shortness of breath',
        location: '123 Medical Plaza, Suite 456, New York, NY 10001'
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
        reason: 'Routine checkup',
        location: '123 Medical Plaza, Suite 456, New York, NY 10001'
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
      },
      {
        id: '6',
        patientId: '106',
        patientName: 'Jennifer Lee',
        patientAvatar: 'https://randomuser.me/api/portraits/women/6.jpg',
        dateTime: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        status: 'completed',
        type: 'in-person',
        notes: 'Patient reported improvement',
        reason: 'Follow-up for previous condition',
        location: '123 Medical Plaza, Suite 456, New York, NY 10001'
      },
      {
        id: '7',
        patientId: '107',
        patientName: 'Robert Taylor',
        patientAvatar: 'https://randomuser.me/api/portraits/men/7.jpg',
        dateTime: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        status: 'cancelled',
        type: 'video',
        notes: 'Patient cancelled due to schedule conflict',
        reason: 'Consultation for chronic pain'
      }
    ] : [
      {
        id: '1',
        doctorId: '1',
        doctorName: 'Dr. Sarah Johnson',
        doctorSpecialty: 'Cardiology',
        doctorAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
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
        dateTime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        status: 'confirmed',
        type: 'video',
        notes: 'Follow-up consultation'
      },
      {
        id: '3',
        doctorId: '2',
        doctorName: 'Dr. Michael Chen',
        doctorSpecialty: 'Dermatology',
        doctorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        dateTime: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        status: 'pending',
        type: 'in-person',
        notes: 'Skin condition examination',
        location: '456 Health Center, Suite 302, New York, NY 10001'
      },
      {
        id: '4',
        doctorId: '3',
        doctorName: 'Dr. Emily Rodriguez',
        doctorSpecialty: 'Pediatrics',
        doctorAvatar: 'https://randomuser.me/api/portraits/women/45.jpg',
        dateTime: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        status: 'completed',
        type: 'in-person',
        notes: 'Routine checkup',
        location: '789 Children\'s Clinic, Floor 4, New York, NY 10001'
      },
      {
        id: '5',
        doctorId: '4',
        doctorName: 'Dr. David Wilson',
        doctorSpecialty: 'Orthopedic Surgery',
        doctorAvatar: 'https://randomuser.me/api/portraits/men/46.jpg',
        dateTime: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        status: 'cancelled',
        type: 'in-person',
        notes: 'Knee pain consultation',
        location: '321 Orthopedic Center, Suite 105, New York, NY 10001'
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

  // Filter and sort appointments
  const filteredAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.dateTime);
    const now = new Date();
    const personName = userProfile?.role === 'doctor' 
      ? appointment.patientName 
      : appointment.doctorName;
    
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      personName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by appointment type
    const matchesType = filterType === 'all' || 
      appointment.type === filterType;
    
    // Filter by tab (upcoming/past/cancelled)
    if (selectedTab === 'upcoming') {
      return appointmentDate >= now && 
        appointment.status !== 'cancelled' && 
        matchesSearch && 
        matchesType;
    } else if (selectedTab === 'past') {
      return (appointmentDate < now && appointment.status !== 'cancelled') || 
        appointment.status === 'completed' && 
        matchesSearch && 
        matchesType;
    } else if (selectedTab === 'cancelled') {
      return appointment.status === 'cancelled' && 
        matchesSearch && 
        matchesType;
    }
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    const dateA = new Date(a.dateTime);
    const dateB = new Date(b.dateTime);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Group appointments by date
  const groupedAppointments = filteredAppointments?.reduce((groups, appointment) => {
    const date = formatDate(appointment.dateTime);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Appointments</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your upcoming and past appointments.
        </p>
      </div>

      {/* Filters and search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
              placeholder={`Search ${userProfile?.role === 'doctor' ? 'patients' : 'doctors'}`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filters {showFilters ? '(Hide)' : '(Show)'}
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Appointment Type
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm rounded-md"
              >
                <option value="all">All Types</option>
                <option value="in-person">In-person</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm rounded-md"
              >
                <option value="asc">Oldest First</option>
                <option value="desc">Newest First</option>
              </select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'upcoming'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setSelectedTab('past')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'past'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setSelectedTab('cancelled')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'cancelled'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Cancelled
          </button>
        </nav>
      </div>

      {/* Appointments list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAppointments?.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <FiCalendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No appointments found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {selectedTab === 'upcoming' 
              ? "You don't have any upcoming appointments." 
              : selectedTab === 'past'
              ? "You don't have any past appointments."
              : "You don't have any cancelled appointments."}
          </p>
          {selectedTab === 'upcoming' && userProfile?.role === 'patient' && (
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/doctors'}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Find a Doctor
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedAppointments || {}).map((date) => (
            <AppointmentGroup
              key={date}
              date={date}
              appointments={groupedAppointments[date]}
              userRole={userProfile?.role}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AppointmentGroup = ({ date, appointments, userRole, formatTime }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-700 text-left"
      >
        <div className="flex items-center">
          <FiCalendar className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{date}</h3>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({appointments.length} appointment{appointments.length !== 1 ? 's' : ''})
          </span>
        </div>
        {isExpanded ? (
          <FiChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <FiChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-6">
              <div className="md:flex md:justify-between md:items-center">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <img
                      className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      src={userRole === 'doctor' ? appointment.patientAvatar : appointment.doctorAvatar}
                      alt={userRole === 'doctor' ? appointment.patientName : appointment.doctorName}
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {userRole === 'doctor' ? appointment.patientName : appointment.doctorName}
                    </h4>
                    {userRole === 'patient' && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {appointment.doctorSpecialty}
                      </p>
                    )}
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FiClock className="mr-1.5 h-4 w-4" />
                      <span>{formatTime(appointment.dateTime)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : appointment.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : appointment.status === 'completed'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  <div className="mt-2 flex items-center text-sm">
                    {appointment.type === 'video' ? (
                      <span className="flex items-center text-primary-600 dark:text-primary-400">
                        <FiVideo className="mr-1.5 h-4 w-4" />
                        Video consultation
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-500 dark:text-gray-400">
                        <FiUser className="mr-1.5 h-4 w-4" />
                        In-person visit
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {appointment.location && (
                <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FiMapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
                  <span>{appointment.location}</span>
                </div>
              )}

              {appointment.notes && (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <strong>Notes:</strong> {appointment.notes}
                </div>
              )}

              {appointment.reason && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <strong>Reason:</strong> {appointment.reason}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {appointment.status === 'confirmed' && new Date(appointment.dateTime) > new Date() && (
                  <>
                    {appointment.type === 'video' && new Date(appointment.dateTime) <= new Date(Date.now() + 15 * 60 * 1000) && (
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        {userRole === 'doctor' ? 'Start Session' : 'Join Session'}
                      </button>
                    )}
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Reschedule
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      Cancel
                    </button>
                  </>
                )}
                
                {appointment.status === 'completed' && (
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    View Summary
                  </button>
                )}
                
                {appointment.status === 'cancelled' && (
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Reschedule
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Appointments;
