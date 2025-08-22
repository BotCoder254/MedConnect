import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight, FiVideo, FiUser, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getAvailableSlots, holdAppointmentSlot, bookAppointment } from '../../services/ScheduleService';
import { formatDate, formatTime } from '../../models/ScheduleModels';

const AppointmentScheduler = ({ doctorId, doctorName, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [insurance, setInsurance] = useState('');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [preferredContact, setPreferredContact] = useState('email');
  const [step, setStep] = useState(1); // 1: Select date, 2: Select time, 3: Enter details, 4: Confirm
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(new Date().setDate(new Date().getDate() + 30)) // 30 days from now
  });
  
  const queryClient = useQueryClient();
  
  // Group dates by week for the calendar view
  const weeks = [];
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  let currentWeek = [];
  const firstDay = new Date(startDate);
  
  // Adjust to start from Sunday
  const dayOfWeek = firstDay.getDay();
  firstDay.setDate(firstDay.getDate() - dayOfWeek);
  
  // Generate weeks
  let currentDate = new Date(firstDay);
  while (currentDate <= endDate) {
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
    
    currentWeek.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Add the last week if it's not complete
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(currentWeek);
  }
  
  // Query for available slots
  const { data: availableSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['availableSlots', doctorId, selectedDate?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      return await getAvailableSlots(doctorId, dayStart, dayEnd);
    },
    enabled: !!selectedDate
  });
  
  // Hold mutation
  const holdMutation = useMutation({
    mutationFn: ({ doctorId, slotId, userId }) => 
      holdAppointmentSlot(doctorId, slotId, userId),
    onSuccess: () => {
      // Move to details step
      setStep(3);
    },
    onError: (error) => {
      console.error('Error holding slot:', error);
      alert('This slot is no longer available. Please select another time.');
      queryClient.invalidateQueries(['availableSlots', doctorId]);
    }
  });
  
  // Book mutation
  const bookMutation = useMutation({
    mutationFn: (appointmentData) => bookAppointment(appointmentData),
    onSuccess: (appointmentId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['availableSlots']);
      queryClient.invalidateQueries(['patientAppointments']);
      queryClient.invalidateQueries(['doctorAppointments']);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(appointmentId);
      }
    },
    onError: (error) => {
      console.error('Error booking appointment:', error);
      alert('There was an error booking your appointment. Please try again.');
    }
  });
  
  // Navigate to next/previous week
  const navigateWeek = (direction) => {
    const newStart = new Date(dateRange.start);
    const newEnd = new Date(dateRange.end);
    
    if (direction === 'next') {
      newStart.setDate(newStart.getDate() + 7);
      newEnd.setDate(newEnd.getDate() + 7);
    } else {
      newStart.setDate(newStart.getDate() - 7);
      newEnd.setDate(newEnd.getDate() - 7);
    }
    
    setDateRange({ start: newStart, end: newEnd });
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(2);
  };
  
  // Handle time slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };
  
  // Handle continue to confirmation
  const handleContinue = () => {
    if (selectedSlot) {
      // Hold the slot
      holdMutation.mutate({
        doctorId,
        slotId: selectedSlot.id,
        userId: currentUser.uid
      });
    }
  };
  
  // Handle appointment booking
  const handleBookAppointment = () => {
    if (!selectedSlot || !currentUser) return;
    
    const appointmentData = {
      doctorId,
      patientId: currentUser.uid,
      slotId: selectedSlot.id,
      type: appointmentType,
      reason,
      notes,
      isUrgent,
      insurance,
      insuranceNumber,
      preferredContact,
      status: 'requested',
      createdAt: new Date(),
      history: [
        {
          status: 'requested',
          timestamp: new Date(),
          note: 'Appointment requested by patient'
        }
      ]
    };
    
    bookMutation.mutate(appointmentData);
  };
  
  // Check if a date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Check if a date is selected
  const isSelectedDate = (date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };
  
  // Group time slots by hour
  const groupedSlots = availableSlots?.reduce((acc, slot) => {
    const hour = new Date(slot.start).getHours();
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(slot);
    return acc;
  }, {});
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary-600 text-white px-6 py-4">
        <h3 className="text-xl font-semibold">Book an Appointment with {doctorName}</h3>
      </div>
      
      {/* Progress steps */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
              step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <span>1</span>
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step >= 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              Select Date
            </span>
          </div>
          
          <div className="flex-grow mx-4 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
              step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <span>2</span>
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step >= 2 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              Select Time
            </span>
          </div>
          
          <div className="flex-grow mx-4 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
              step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <span>3</span>
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step >= 3 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              Confirm
            </span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Date */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Select a Date
                </h4>
                
                {/* Calendar navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(dateRange.start, { month: 'long', year: 'numeric', day: undefined, weekday: undefined })}
                  </span>
                  
                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Calendar */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Days of week header */}
                  <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                      <div key={idx} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7">
                      {week.map((date, dateIdx) => {
                        const isDisabled = isPastDate(date);
                        const isSelected = isSelectedDate(date);
                        const isTodayDate = isToday(date);
                        const isCurrentMonth = date.getMonth() === dateRange.start.getMonth();
                        
                        return (
                          <button
                            key={dateIdx}
                            onClick={() => !isDisabled && handleDateSelect(date)}
                            disabled={isDisabled}
                            className={`
                              py-4 relative
                              ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                              ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                              ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}
                              ${dateIdx === 0 ? 'border-l-0' : 'border-l border-gray-200 dark:border-gray-700'}
                              ${weekIdx < weeks.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                            `}
                          >
                            <div className="text-center">
                              <span className={`
                                inline-flex items-center justify-center h-7 w-7 rounded-full text-sm
                                ${isTodayDate ? 'bg-primary-500 text-white' : ''}
                                ${isSelected && !isTodayDate ? 'border-2 border-primary-500 text-primary-700 dark:text-primary-400' : ''}
                              `}>
                                {date.getDate()}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => selectedDate && setStep(2)}
                  disabled={!selectedDate}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white
                    ${selectedDate ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}
                  `}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Select Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Select a Time
                  </h4>
                  
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                  >
                    Change Date
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <FiCalendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedDate)}
                    </span>
                  </div>
                </div>
                
                {/* Appointment type selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Appointment Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAppointmentType('in-person')}
                      className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        appointmentType === 'in-person'
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FiUser className="mr-2 h-4 w-4" />
                      In-Person Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppointmentType('telemedicine')}
                      className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        appointmentType === 'telemedicine'
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FiVideo className="mr-2 h-4 w-4" />
                      Video Visit
                    </button>
                  </div>
                </div>
                
                {/* Available time slots */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Available Times
                  </h5>
                  
                  {slotsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : !groupedSlots || Object.keys(groupedSlots).length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        No available appointments for this date.
                      </p>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                      >
                        Select a different date
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-64 overflow-y-auto pr-2">
                      {Object.entries(groupedSlots)
                        .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
                        .map(([hour, slots]) => (
                          <div key={hour}>
                            <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              {new Date(slots[0].start).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                            </h6>
                            <div className="grid grid-cols-3 gap-2">
                              {slots.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() => handleSlotSelect(slot)}
                                  className={`py-2 px-3 text-sm rounded-md ${
                                    selectedSlot?.id === slot.id
                                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  {formatTime(slot.start)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                
                <button
                  onClick={handleContinue}
                  disabled={!selectedSlot || holdMutation.isLoading}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white
                    ${selectedSlot && !holdMutation.isLoading ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}
                  `}
                >
                  {holdMutation.isLoading ? 'Reserving...' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Step 3: Enter Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Appointment Details
                </h4>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedDate)} at {formatTime(selectedSlot.start)}
                      </span>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                    >
                      Change
                    </button>
                  </div>
                </div>
                
                {/* Visit Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visit Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAppointmentType('in-person')}
                      className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        appointmentType === 'in-person'
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FiUser className="mr-2 h-4 w-4" />
                      In-Person Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppointmentType('telemedicine')}
                      className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        appointmentType === 'telemedicine'
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FiVideo className="mr-2 h-4 w-4" />
                      Video Visit
                    </button>
                  </div>
                </div>
                
                {/* Reason for visit */}
                <div className="mb-4">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Visit <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reason"
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                    placeholder="Briefly describe the reason for your visit"
                    required
                  ></textarea>
                </div>
                
                {/* Urgent flag */}
                <div className="mb-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="urgent"
                        type="checkbox"
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="urgent" className="font-medium text-gray-700 dark:text-gray-300">
                        This is urgent
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">
                        Mark as urgent if you need immediate attention. The doctor's office may contact you to reschedule for an earlier time.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Insurance information */}
                <div className="mb-4">
                  <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    id="insurance"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                    placeholder="e.g., Blue Cross Blue Shield, Aetna, etc."
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Insurance ID / Member Number
                  </label>
                  <input
                    type="text"
                    id="insuranceNumber"
                    value={insuranceNumber}
                    onChange={(e) => setInsuranceNumber(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                    placeholder="Your insurance ID or member number"
                  />
                </div>
                
                {/* Preferred contact method */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPreferredContact('email')}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        preferredContact === 'email'
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredContact('phone')}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        preferredContact === 'phone'
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Phone
                    </button>
                  </div>
                </div>
                
                {/* Additional notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                    placeholder="Any additional information you'd like to share"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                
                <button
                  onClick={() => setStep(4)}
                  disabled={!reason}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white
                    ${reason ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}
                  `}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Step 4: Confirm */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Confirm Your Appointment
                </h4>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FiCalendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(selectedDate)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedSlot && formatTime(selectedSlot.start)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      {appointmentType === 'telemedicine' ? (
                        <FiVideo className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                      ) : (
                        <FiUser className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {appointmentType === 'telemedicine' ? 'Video Visit' : 'In-Person Visit'}
                        </p>
                        {appointmentType === 'in-person' && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            123 Medical Plaza, Suite 456, New York, NY 10001
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {isUrgent && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5 mr-3">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30">
                            <span className="text-red-600 dark:text-red-400 text-xs font-medium">!</span>
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            Marked as Urgent
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            The doctor's office may contact you to reschedule.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Appointment Details</h5>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Reason:</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{reason}</dd>
                        </div>
                        
                        {insurance && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Insurance:</dt>
                            <dd className="text-sm text-gray-900 dark:text-white">{insurance}</dd>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Contact via:</dt>
                          <dd className="text-sm text-gray-900 dark:text-white capitalize">{preferredContact}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By confirming this appointment, you agree to our{' '}
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                    cancellation policy
                  </a>
                  . You may cancel or reschedule up to 24 hours before your appointment without any fees.
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                
                <button
                  onClick={handleBookAppointment}
                  disabled={bookMutation.isLoading}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white
                    ${!bookMutation.isLoading ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}
                  `}
                >
                  {bookMutation.isLoading ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
