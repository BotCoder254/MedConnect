import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getAvailableSlots, rescheduleAppointment } from '../../services/ScheduleService';
import { formatDate, formatTime } from '../../models/ScheduleModels';

const RescheduleAppointment = ({ appointment, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [step, setStep] = useState(1); // 1: Select date, 2: Select time, 3: Confirm
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
    queryKey: ['availableSlots', appointment.doctorId, selectedDate?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      return await getAvailableSlots(appointment.doctorId, dayStart, dayEnd);
    },
    enabled: !!selectedDate
  });
  
  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: (rescheduleData) => rescheduleAppointment(rescheduleData),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['availableSlots']);
      queryClient.invalidateQueries(['patientAppointments']);
      queryClient.invalidateQueries(['doctorAppointments']);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Error rescheduling appointment:', error);
      alert('There was an error rescheduling your appointment. Please try again.');
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
      setStep(3);
    }
  };
  
  // Handle appointment rescheduling
  const handleReschedule = () => {
    if (!selectedSlot || !currentUser) return;
    
    const rescheduleData = {
      appointmentId: appointment.id,
      oldSlotId: appointment.slotId,
      newSlotId: selectedSlot.id,
      reason: reason || 'Patient requested reschedule',
      userId: currentUser.uid,
    };
    
    rescheduleMutation.mutate(rescheduleData);
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
  
  // Format original appointment date for display
  const originalDate = new Date(appointment.start);
  const formattedOriginalDate = formatDate(originalDate);
  const formattedOriginalTime = formatTime(originalDate);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary-600 text-white px-6 py-4">
        <h3 className="text-xl font-semibold">Reschedule Your Appointment</h3>
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
      
      {/* Original appointment info */}
      <div className="px-6 mb-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500/50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                You are rescheduling your appointment originally scheduled for:
              </p>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mt-1">
                {formattedOriginalDate} at {formattedOriginalTime}
              </p>
            </div>
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
                  Select a New Date
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
                    Select a New Time
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
                  disabled={!selectedSlot}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white
                    ${selectedSlot ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}
                  `}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Step 3: Confirm */}
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
                  Confirm Rescheduling
                </h4>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Appointment</h5>
                      <div className="flex items-start">
                        <FiCalendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formattedOriginalDate}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formattedOriginalTime}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Appointment</h5>
                      <div className="flex items-start">
                        <FiCalendar className="h-5 w-5 text-primary-500 dark:text-primary-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(selectedDate)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedSlot && formatTime(selectedSlot.start)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reason for rescheduling */}
                <div className="mb-4">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Rescheduling (optional)
                  </label>
                  <textarea
                    id="reason"
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                    placeholder="Please provide a reason for rescheduling"
                  ></textarea>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By rescheduling this appointment, your original appointment will be cancelled. The doctor's office will be notified of this change.
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                
                <button
                  onClick={handleReschedule}
                  disabled={rescheduleMutation.isLoading}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white
                    ${!rescheduleMutation.isLoading ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}
                  `}
                >
                  {rescheduleMutation.isLoading ? 'Processing...' : 'Confirm Reschedule'}
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Success state */}
          {rescheduleMutation.isSuccess && (
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
                Appointment Rescheduled!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Your appointment has been successfully rescheduled to {formatDate(selectedDate)} at {formatTime(selectedSlot.start)}.
              </p>
              
              <a 
                href="#" 
                download="updated_appointment.ics"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mb-4"
              >
                <FiCalendar className="mr-2 -ml-1 h-4 w-4" />
                Add to Calendar (ICS)
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RescheduleAppointment;
