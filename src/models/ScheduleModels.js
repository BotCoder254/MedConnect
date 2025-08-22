// Schedule models for doctor availability and appointments

/**
 * Schedule Template Model
 * 
 * Represents a doctor's weekly availability template
 */
export const ScheduleTemplateModel = {
  doctorId: '', // Reference to the doctor
  timezone: '', // Doctor's timezone (e.g., 'America/New_York')
  defaultSlotDuration: 30, // Default appointment duration in minutes
  weeklyHours: [
    // Sunday
    {
      dayOfWeek: 0,
      available: false,
      slots: [] // Array of { start: '09:00', end: '12:00' } objects
    },
    // Monday
    {
      dayOfWeek: 1,
      available: true,
      slots: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '17:00' }
      ]
    },
    // Tuesday
    {
      dayOfWeek: 2,
      available: true,
      slots: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '17:00' }
      ]
    },
    // Wednesday
    {
      dayOfWeek: 3,
      available: true,
      slots: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '17:00' }
      ]
    },
    // Thursday
    {
      dayOfWeek: 4,
      available: true,
      slots: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '17:00' }
      ]
    },
    // Friday
    {
      dayOfWeek: 5,
      available: true,
      slots: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '17:00' }
      ]
    },
    // Saturday
    {
      dayOfWeek: 6,
      available: false,
      slots: []
    }
  ],
  bufferTime: 10, // Buffer time between appointments in minutes
  createdAt: null, // Timestamp
  updatedAt: null // Timestamp
};

/**
 * Schedule Exception Model
 * 
 * Represents exceptions to the weekly template (vacations, holidays, special hours)
 */
export const ScheduleExceptionModel = {
  doctorId: '', // Reference to the doctor
  type: 'unavailable', // 'unavailable' or 'special-hours'
  startDate: null, // Date object or timestamp
  endDate: null, // Date object or timestamp
  reason: '', // e.g., 'Vacation', 'Holiday', 'Conference'
  // Only used if type is 'special-hours'
  specialHours: [
    // { date: '2023-07-15', slots: [{ start: '10:00', end: '14:00' }] }
  ],
  createdAt: null, // Timestamp
  updatedAt: null // Timestamp
};

/**
 * Appointment Slot Model
 * 
 * Represents a materialized appointment slot
 */
export const AppointmentSlotModel = {
  doctorId: '', // Reference to the doctor
  start: null, // Date object or timestamp for start time
  end: null, // Date object or timestamp for end time
  status: 'free', // 'free', 'held', 'booked', 'cancelled'
  appointmentId: null, // Reference to appointment if booked
  heldBy: null, // User ID if status is 'held'
  holdExpiresAt: null, // Timestamp when hold expires
  type: 'in-person', // 'in-person' or 'telemedicine'
  createdAt: null, // Timestamp
  updatedAt: null // Timestamp
};

/**
 * Appointment Model
 * 
 * Represents a booked appointment
 */
export const AppointmentModel = {
  doctorId: '', // Reference to the doctor
  patientId: '', // Reference to the patient
  slotId: '', // Reference to the appointment slot
  start: null, // Date object or timestamp
  end: null, // Date object or timestamp
  status: 'confirmed', // 'confirmed', 'completed', 'cancelled', 'no-show'
  type: 'in-person', // 'in-person' or 'telemedicine'
  reason: '', // Reason for visit
  notes: '', // Additional notes
  location: '', // Location for in-person appointments
  meetingLink: '', // Link for telemedicine appointments
  cancellationReason: '', // Reason if cancelled
  createdAt: null, // Timestamp
  updatedAt: null // Timestamp
};

/**
 * Generate available time slots based on schedule template
 * 
 * @param {Object} template - Schedule template
 * @param {Date} startDate - Start date for slot generation
 * @param {Date} endDate - End date for slot generation
 * @param {Array} exceptions - Array of schedule exceptions
 * @returns {Array} Array of available time slots
 */
export const generateAvailableSlots = (template, startDate, endDate, exceptions = []) => {
  const slots = [];
  const currentDate = new Date(startDate);
  const slotDuration = template.defaultSlotDuration;
  const bufferTime = template.bufferTime;
  
  // Loop through each day in the date range
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dayTemplate = template.weeklyHours[dayOfWeek];
    
    // Check if day is available in template
    if (dayTemplate.available) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check for exceptions
      const exception = exceptions.find(ex => {
        const exStartDate = new Date(ex.startDate);
        const exEndDate = new Date(ex.endDate);
        return currentDate >= exStartDate && currentDate <= exEndDate;
      });
      
      // If there's an unavailable exception, skip this day
      if (exception && exception.type === 'unavailable') {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      // Get slots for this day (either from template or special hours)
      let daySlots = [];
      
      if (exception && exception.type === 'special-hours') {
        const specialDay = exception.specialHours.find(sh => sh.date === dateString);
        if (specialDay) {
          daySlots = specialDay.slots;
        } else {
          daySlots = dayTemplate.slots;
        }
      } else {
        daySlots = dayTemplate.slots;
      }
      
      // Generate individual appointment slots for each time range
      daySlots.forEach(timeRange => {
        const [startHour, startMinute] = timeRange.start.split(':').map(Number);
        const [endHour, endMinute] = timeRange.end.split(':').map(Number);
        
        const slotStartTime = new Date(currentDate);
        slotStartTime.setHours(startHour, startMinute, 0, 0);
        
        const rangeEndTime = new Date(currentDate);
        rangeEndTime.setHours(endHour, endMinute, 0, 0);
        
        // Create slots until we reach the end time
        while (slotStartTime < rangeEndTime) {
          const slotEndTime = new Date(slotStartTime);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);
          
          // Only add the slot if it fits within the time range
          if (slotEndTime <= rangeEndTime) {
            slots.push({
              doctorId: template.doctorId,
              start: new Date(slotStartTime),
              end: new Date(slotEndTime),
              status: 'free',
              type: 'in-person', // Default, can be changed later
              createdAt: new Date()
            });
          }
          
          // Move to next slot start time (including buffer)
          slotStartTime.setMinutes(slotStartTime.getMinutes() + slotDuration + bufferTime);
        }
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
};

/**
 * Check if a slot is available
 * 
 * @param {Array} existingAppointments - Array of existing appointments
 * @param {Date} start - Start time to check
 * @param {Date} end - End time to check
 * @returns {Boolean} True if slot is available
 */
export const isSlotAvailable = (existingAppointments, start, end) => {
  return !existingAppointments.some(appointment => {
    const appointmentStart = new Date(appointment.start);
    const appointmentEnd = new Date(appointment.end);
    
    // Check for overlap
    return (
      (start >= appointmentStart && start < appointmentEnd) || // Start time is within existing appointment
      (end > appointmentStart && end <= appointmentEnd) || // End time is within existing appointment
      (start <= appointmentStart && end >= appointmentEnd) // Slot completely contains existing appointment
    );
  });
};

/**
 * Format a date for display
 * 
 * @param {Date|String} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {String} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format a time for display
 * 
 * @param {Date|String} date - Date to format
 * @returns {String} Formatted time string
 */
export const formatTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  });
};
