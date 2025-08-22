import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiCheck, FiCalendar, FiVideo, FiMessageSquare } from 'react-icons/fi';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5 }
    })
  };

  const features = [
    {
      icon: <FiCalendar className="h-6 w-6" />,
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments with your preferred doctors with just a few clicks. Manage all your appointments in one place.'
    },
    {
      icon: <FiVideo className="h-6 w-6" />,
      title: 'Video Consultations',
      description: 'Connect with healthcare professionals from the comfort of your home through secure video consultations.'
    },
    {
      icon: <FiMessageSquare className="h-6 w-6" />,
      title: 'Secure Messaging',
      description: 'Communicate directly with your healthcare providers through our secure messaging platform.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      content: 'MedConnect has made it so much easier to find specialists and book appointments. The video consultation feature saved me so much time!',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      content: 'As a doctor, MedConnect has streamlined my practice. The appointment management system is intuitive and the patient communication tools are excellent.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Patient',
      content: "I love how easy it is to find doctors based on specialty and read reviews from other patients. It's helped me make informed decisions about my healthcare.",
      avatar: 'https://randomuser.me/api/portraits/women/23.jpg'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to doctors page with search query
    window.location.href = `/doctors?search=${encodeURIComponent(searchQuery)}`;
  };
  
  // Handle real-time search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Sample suggestions - in a real app, these would come from Firebase
  const specialties = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'Neurology', 'Obstetrics', 'Ophthalmology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'Urology'
  ];
  
  const conditions = [
    'Allergies', 'Arthritis', 'Asthma', 'Back Pain', 'Diabetes',
    'Headaches', 'Heart Disease', 'High Blood Pressure', 'Insomnia'
  ];
  
  const doctors = [
    'Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Rodriguez',
    'Dr. David Wilson', 'Dr. Lisa Patel'
  ];
  
  // Update suggestions as user types
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filteredSpecialties = specialties
      .filter(s => s.toLowerCase().includes(query))
      .map(s => ({ type: 'specialty', text: s }));
      
    const filteredConditions = conditions
      .filter(c => c.toLowerCase().includes(query))
      .map(c => ({ type: 'condition', text: c }));
      
    const filteredDoctors = doctors
      .filter(d => d.toLowerCase().includes(query))
      .map(d => ({ type: 'doctor', text: d }));
    
    const allSuggestions = [
      ...filteredSpecialties,
      ...filteredConditions,
      ...filteredDoctors
    ].slice(0, 5); // Limit to 5 suggestions
    
    setSearchSuggestions(allSuggestions);
    setShowSuggestions(allSuggestions.length > 0);
  }, [searchQuery]);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1631815588090-d1bcbe9b4b38?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" 
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              custom={0}
              className="text-center lg:text-left"
            >
              <motion.h1
                variants={fadeIn}
                custom={1}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Your Health, Our Priority
              </motion.h1>
              <motion.p
                variants={fadeIn}
                custom={2}
                className="text-lg md:text-xl text-white/90 mb-8"
              >
                Connect with top healthcare professionals, book appointments, and manage your health journey all in one place.
              </motion.p>

              <motion.div
                variants={fadeIn}
                custom={3}
                className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Link
                  to="/doctors"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                  Find a Doctor
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                >
                  Sign Up Free
                </Link>
              </motion.div>

              <motion.div
                variants={fadeIn}
                custom={4}
                className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6"
              >
                <div className="flex items-center">
                  <div className="bg-white/20 p-1 rounded-full">
                    <FiCheck className="h-4 w-4 text-white" />
                  </div>
                  <span className="ml-2 text-sm text-white">Verified Doctors</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-1 rounded-full">
                    <FiCheck className="h-4 w-4 text-white" />
                  </div>
                  <span className="ml-2 text-sm text-white">Secure Platform</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-1 rounded-full">
                    <FiCheck className="h-4 w-4 text-white" />
                  </div>
                  <span className="ml-2 text-sm text-white">Open Source</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden lg:block"
            >
              <img
                src="https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg?w=826&t=st=1689338333~exp=1689338933~hmac=64cd9a3e9a03d127db0a19e201d72071d0d138472802397d111f1c8d3d76f77a"
                alt="Doctor illustration"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                  placeholder="Search by specialty, doctor name, or condition"
                />
                
                {/* Search suggestions */}
                {showSuggestions && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        onClick={() => {
                          setSearchQuery(suggestion.text);
                          setShowSuggestions(false);
                        }}
                      >
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full mr-2 text-xs ${
                          suggestion.type === 'specialty' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            : suggestion.type === 'condition'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                        }`}>
                          {suggestion.type === 'specialty' ? 'S' : suggestion.type === 'condition' ? 'C' : 'D'}
                        </span>
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <button
                  type="submit"
                  className="w-full md:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Search Doctors
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Simplifying Healthcare Access
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Our platform connects patients with healthcare providers through an intuitive and secure interface.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-8 text-center"
              >
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Hear from patients and doctors who have experienced the benefits of our platform.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8"
              >
                <div className="flex items-center mb-6">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-white mb-6"
            >
              Ready to take control of your healthcare?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-xl text-white/90 mb-8 max-w-3xl mx-auto"
            >
              Join thousands of patients and healthcare providers on our platform today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Sign Up Free
              </Link>
              <Link
                to="/doctors"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Browse Doctors
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Find answers to common questions about our platform.
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-gray-200 dark:divide-gray-700">
            <FAQ 
              question="How do I book an appointment with a doctor?"
              answer="You can search for doctors by specialty, location, or name. Once you find a doctor you'd like to see, you can view their available time slots and book an appointment directly through our platform."
              index={0}
            />
            <FAQ 
              question="Are all doctors on the platform verified?"
              answer="Yes, all healthcare professionals on our platform go through a verification process to ensure they have valid credentials and licenses to practice."
              index={1}
            />
            <FAQ 
              question="How do virtual consultations work?"
              answer="Virtual consultations are conducted through our secure video platform. Once you book a virtual appointment, you'll receive a link to join the video call at the scheduled time."
              index={2}
            />
            <FAQ 
              question="Is my medical information secure?"
              answer="Yes, we take data security very seriously. All personal and medical information is encrypted and stored securely in compliance with healthcare privacy regulations."
              index={3}
            />
            <FAQ 
              question="Can I use insurance for appointments booked through the platform?"
              answer="Yes, many doctors on our platform accept insurance. You can filter your search results to show only doctors who accept your insurance provider."
              index={4}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FAQ = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="py-6"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left focus:outline-none"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{question}</h3>
        <span className="ml-6 flex-shrink-0">
          <svg
            className={`h-6 w-6 transform ${isOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200 ease-in-out text-gray-500 dark:text-gray-400`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="mt-2 overflow-hidden"
      >
        <p className="text-gray-600 dark:text-gray-300">{answer}</p>
      </motion.div>
    </motion.div>
  );
};

export default Home;
