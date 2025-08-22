import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FiSearch, FiMapPin, FiStar, FiFilter, FiClock, FiVideo, FiCalendar } from 'react-icons/fi';

const DoctorDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch doctors from Firestore
  const { data: doctors, isLoading, error } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      try {
        const doctorsRef = collection(db, 'doctors');
        // Simplified query to avoid composite index requirement
        let q = query(doctorsRef);
        
        const querySnapshot = await getDocs(q);
        // Filter and sort on the client side instead
        return querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(doc => doc.verified === true)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 20);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        throw new Error('Failed to fetch doctors');
      }
    },
    // For demo purposes, use placeholder data if Firebase isn't set up
    placeholderData: [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        specialties: ['Cardiology', 'Internal Medicine'],
        bio: 'Board-certified cardiologist with over 15 years of experience in treating heart conditions.',
        rating: 4.9,
        reviewCount: 124,
        location: 'New York, NY',
        avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
        telemedicineEnabled: true,
        nextAvailable: '2023-07-15T10:00:00'
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        specialties: ['Dermatology'],
        bio: 'Specializing in medical and cosmetic dermatology with a focus on skin cancer prevention.',
        rating: 4.8,
        reviewCount: 98,
        location: 'San Francisco, CA',
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        telemedicineEnabled: true,
        nextAvailable: '2023-07-14T14:30:00'
      },
      {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        specialties: ['Pediatrics', 'Allergy & Immunology'],
        bio: 'Dedicated to providing compassionate care for children with a special interest in allergies and asthma.',
        rating: 4.7,
        reviewCount: 156,
        location: 'Chicago, IL',
        avatarUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
        telemedicineEnabled: false,
        nextAvailable: '2023-07-16T09:15:00'
      },
      {
        id: '4',
        name: 'Dr. David Wilson',
        specialties: ['Orthopedic Surgery', 'Sports Medicine'],
        bio: 'Orthopedic surgeon focusing on minimally invasive procedures and sports-related injuries.',
        rating: 4.9,
        reviewCount: 87,
        location: 'Boston, MA',
        avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
        telemedicineEnabled: true,
        nextAvailable: '2023-07-18T11:00:00'
      },
      {
        id: '5',
        name: 'Dr. Lisa Patel',
        specialties: ['Psychiatry', 'Behavioral Health'],
        bio: 'Psychiatrist specializing in anxiety disorders, depression, and PTSD treatment.',
        rating: 4.6,
        reviewCount: 112,
        location: 'Seattle, WA',
        avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
        telemedicineEnabled: true,
        nextAvailable: '2023-07-13T15:45:00'
      },
      {
        id: '6',
        name: 'Dr. Robert Thompson',
        specialties: ['Neurology'],
        bio: 'Neurologist with expertise in headache management, epilepsy, and neurodegenerative disorders.',
        rating: 4.8,
        reviewCount: 76,
        location: 'Austin, TX',
        avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
        telemedicineEnabled: false,
        nextAvailable: '2023-07-17T13:30:00'
      }
    ]
  });

  // Filter specialties
  const specialties = [
    'All Specialties',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'Gynecology',
    'Urology',
    'Ophthalmology',
    'ENT'
  ];

  // Filter locations
  const locations = [
    'All Locations',
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Francisco, CA'
  ];

  // Filter doctors based on search and filters
  const filteredDoctors = doctors?.filter(doctor => {
    const matchesSearch = searchQuery === '' || 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialty = specialty === '' || specialty === 'All Specialties' ||
      doctor.specialties.some(s => s === specialty);
    
    const matchesLocation = location === '' || location === 'All Locations' ||
      doctor.location === location;
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  // Format date for next available appointment
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format time for next available appointment
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Find the Right Doctor for You
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Search from our network of verified healthcare professionals
          </motion.p>
        </div>

        {/* Search and Filter Section */}
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
                placeholder="Search by doctor name or specialty"
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
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialty
                </label>
                <select
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm rounded-md"
                >
                  {specialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm rounded-md"
                >
                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-300">
              An error occurred while fetching doctors. Please try again later.
            </div>
          ) : filteredDoctors?.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No doctors found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            filteredDoctors?.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6 md:flex md:items-start">
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <img
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      src={doctor.avatarUrl}
                      alt={doctor.name}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {doctor.name}
                        </h3>
                        <div className="mt-1 flex items-center">
                          <div className="flex items-center">
                            <FiStar className="text-yellow-400 h-4 w-4 mr-1" />
                            <span className="text-gray-900 dark:text-white font-medium">{doctor.rating}</span>
                          </div>
                          <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-gray-500 dark:text-gray-400">{doctor.reviewCount} reviews</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {doctor.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Link
                          to={`/doctors/${doctor.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {doctor.bio}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <FiMapPin className="mr-1 h-4 w-4" />
                        {doctor.location}
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <FiClock className="mr-1 h-4 w-4" />
                        Next available: {formatDate(doctor.nextAvailable)} at {formatTime(doctor.nextAvailable)}
                      </div>
                      {doctor.telemedicineEnabled && (
                        <div className="flex items-center text-primary-600 dark:text-primary-400">
                          <FiVideo className="mr-1 h-4 w-4" />
                          Video visits available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FiCalendar className="mr-1 h-4 w-4" />
                    {doctor.telemedicineEnabled ? 'In-person & video appointments' : 'In-person appointments only'}
                  </div>
                  <Link
                    to={`/doctors/${doctor.id}?book=true`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Book Appointment
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDirectory;
