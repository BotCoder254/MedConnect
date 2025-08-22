import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FiMapPin, FiStar, FiClock, FiVideo, FiCalendar, FiPhone, FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Modal from '../components/ui/Modal';
import AppointmentScheduler from '../components/scheduling/AppointmentScheduler';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showBookingModal = searchParams.get('book') === 'true';
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(showBookingModal);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  
  // Open booking modal if URL has book=true
  useEffect(() => {
    if (showBookingModal) {
      setIsBookingModalOpen(true);
    }
  }, [showBookingModal]);

  // Fetch doctor data from Firestore
  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      try {
        const docRef = doc(db, 'doctors', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          throw new Error('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
        throw new Error('Failed to fetch doctor data');
      }
    },
    // For demo purposes, use placeholder data if Firebase isn't set up
    placeholderData: {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialties: ['Cardiology', 'Internal Medicine'],
      bio: 'Dr. Johnson is a board-certified cardiologist with over 15 years of experience in treating heart conditions. She completed her medical degree at Harvard Medical School and her residency at Massachusetts General Hospital. Dr. Johnson is known for her patient-centered approach to care and expertise in preventive cardiology.',
      rating: 4.9,
      reviewCount: 124,
      location: 'New York, NY',
      address: '123 Medical Plaza, Suite 456, New York, NY 10001',
      phoneNumber: '(212) 555-1234',
      email: 'dr.johnson@medconnect.com',
      education: [
        { degree: 'MD', institution: 'Harvard Medical School', year: '2005' },
        { degree: 'Residency', institution: 'Massachusetts General Hospital', year: '2009' },
        { degree: 'Fellowship', institution: 'Cleveland Clinic', year: '2011' }
      ],
      languages: ['English', 'Spanish'],
      avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      telemedicineEnabled: true,
      nextAvailable: '2023-07-15T10:00:00',
      services: [
        'General cardiology consultation',
        'Heart disease prevention',
        'Echocardiography',
        'Stress testing',
        'Holter monitoring'
      ],
      insuranceAccepted: [
        'Blue Cross Blue Shield',
        'Aetna',
        'Cigna',
        'UnitedHealthcare',
        'Medicare'
      ],
      availableTimeSlots: [
        { date: '2023-07-15', slots: ['09:00', '10:30', '14:00', '15:30'] },
        { date: '2023-07-16', slots: ['11:00', '13:30', '16:00'] },
        { date: '2023-07-17', slots: ['09:30', '10:30', '14:30'] }
      ],
      reviews: [
        {
          id: '1',
          patientName: 'John D.',
          rating: 5,
          date: '2023-06-10',
          comment: 'Dr. Johnson is an excellent cardiologist. She took the time to explain my condition thoroughly and answered all my questions. Highly recommend!'
        },
        {
          id: '2',
          patientName: 'Maria S.',
          rating: 4,
          date: '2023-05-22',
          comment: 'Very knowledgeable doctor with a great bedside manner. The wait time was a bit long, but the care was worth it.'
        },
        {
          id: '3',
          patientName: 'Robert T.',
          rating: 5,
          date: '2023-04-15',
          comment: 'Dr. Johnson helped me manage my heart condition effectively. I appreciate her thoroughness and attention to detail.'
        }
      ]
    }
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Handle booking
  const handleBookAppointment = () => {
    setIsBookingModalOpen(true);
  };
  
  // Handle booking success
  const handleBookingSuccess = (appointmentId) => {
    setAppointmentId(appointmentId);
    setBookingSuccess(true);
    
    // Close the booking modal after a delay
    setTimeout(() => {
      setIsBookingModalOpen(false);
      // Navigate to appointments page
      navigate('/dashboard/appointments');
    }, 3000);
  };
  
  // Handle booking modal close
  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    // Remove the book=true query parameter
    if (showBookingModal) {
      navigate(`/doctors/${id}`, { replace: true });
    }
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Error</h2>
          <p className="mt-2 text-red-700 dark:text-red-400">
            {error?.message || 'Failed to load doctor profile. Please try again later.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-4 w-4" />
            Back to doctors
          </button>
        </div>

        {/* Doctor profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8"
        >
          <div className="p-6 md:p-8 md:flex md:items-start">
            <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
              <img
                className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                src={doctor.avatarUrl}
                alt={doctor.name}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {doctor.name}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {doctor.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <FiStar className="text-yellow-400 h-4 w-4 mr-1" />
                      <span className="text-gray-900 dark:text-white font-medium">{doctor.rating}</span>
                    </div>
                    <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">{doctor.reviewCount} reviews</span>
                    {doctor.telemedicineEnabled && (
                      <>
                        <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                        <span className="flex items-center text-primary-600 dark:text-primary-400">
                          <FiVideo className="mr-1 h-4 w-4" />
                          Video visits
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={handleBookAppointment}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FiCalendar className="mr-2 -ml-1 h-4 w-4" />
                    Book Appointment
                  </button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {doctor.bio}
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiMapPin className="mr-2 h-4 w-4" />
                  <span>{doctor.address}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiPhone className="mr-2 h-4 w-4" />
                  <span>{doctor.phoneNumber}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiMail className="mr-2 h-4 w-4" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiClock className="mr-2 h-4 w-4" />
                  <span>Next available: {formatDate(doctor.nextAvailable)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {doctor.bio}
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Education & Training</h3>
              <div className="space-y-4 mb-6">
                {doctor.education.map((edu, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        {edu.year}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{edu.degree}</p>
                      <p className="text-gray-500 dark:text-gray-400">{edu.institution}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {doctor.languages.map((language) => (
                  <span
                    key={language}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {language}
                  </span>
                ))}
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Services</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300 mb-6">
                {doctor.services.map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Insurance Accepted</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.insuranceAccepted.map((insurance) => (
                  <span
                    key={insurance}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {insurance}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Reviews section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Patient Reviews</h2>
                <div className="flex items-center">
                  <FiStar className="text-yellow-400 h-5 w-5 mr-1" />
                  <span className="text-gray-900 dark:text-white font-medium text-lg">{doctor.rating}</span>
                  <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-gray-500 dark:text-gray-400">{doctor.reviewCount} reviews</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {doctor.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{review.patientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{review.date}</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                  See all reviews
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right column - Booking widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Book an Appointment</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Soon</h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <p>Next available: {formatDate(doctor.nextAvailable)}</p>
                  <p className="mt-2">This doctor has {doctor.availableTimeSlots.length} days with open slots in the next week.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleBookAppointment}
                  className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Book Appointment
                </button>
                
                {doctor.telemedicineEnabled && (
                  <button
                    onClick={handleBookAppointment}
                    className="w-full py-2 px-4 border border-primary-600 dark:border-primary-500 rounded-md shadow-sm text-sm font-medium text-primary-600 dark:text-primary-400 bg-white dark:bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FiVideo className="inline-block mr-2 -ml-1" />
                    Schedule Video Visit
                  </button>
                )}
              </div>
              
              <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                <p>Free cancellation up to 24 hours before your appointment</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        size="lg"
      >
        <AnimatePresence mode="wait">
          {bookingSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-6 text-center"
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <FiCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Appointment Requested Successfully!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Your appointment request has been submitted. You will receive a confirmation email once the doctor's office approves it.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Next Steps:</h4>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-2">1</span>
                    <span>Check your email for confirmation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-2">2</span>
                    <span>Add to your calendar</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-2">3</span>
                    <span>Complete any pre-appointment forms if required</span>
                  </li>
                </ul>
              </div>
              
              <a 
                href="#" 
                download="appointment.ics"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mb-4"
              >
                <FiCalendar className="mr-2 -ml-1 h-4 w-4" />
                Add to Calendar (ICS)
              </a>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="bg-primary-500 h-1.5 rounded-full"
                ></motion.div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Redirecting to appointments page...
              </p>
            </motion.div>
          ) : (
            <AppointmentScheduler
              doctorId={doctor.id}
              doctorName={doctor.name}
              onSuccess={handleBookingSuccess}
              onCancel={handleCloseBookingModal}
            />
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
};

export default DoctorProfile;
