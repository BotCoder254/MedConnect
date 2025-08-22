import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  runTransaction,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Create or update a doctor's schedule template
 * 
 * @param {Object} scheduleTemplate - The schedule template data
 * @returns {Promise<string>} - The ID of the created/updated schedule
 */
export const saveScheduleTemplate = async (scheduleTemplate) => {
  try {
    const doctorId = scheduleTemplate.doctorId;
    const scheduleRef = doc(db, `doctors/${doctorId}/schedules/default`);
    
    await setDoc(scheduleRef, {
      ...scheduleTemplate,
      updatedAt: serverTimestamp(),
      createdAt: scheduleTemplate.createdAt || serverTimestamp()
    });
    
    return 'default';
  } catch (error) {
    console.error('Error saving schedule template:', error);
    throw error;
  }
};

/**
 * Get a doctor's schedule template
 * 
 * @param {string} doctorId - The doctor's ID
 * @returns {Promise<Object|null>} - The schedule template or null if not found
 */
export const getScheduleTemplate = async (doctorId) => {
  try {
    const scheduleRef = doc(db, `doctors/${doctorId}/schedules/default`);
    const scheduleSnap = await getDoc(scheduleRef);
    
    if (scheduleSnap.exists()) {
      return { id: scheduleSnap.id, ...scheduleSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting schedule template:', error);
    throw error;
  }
};

/**
 * Add a schedule exception (vacation, special hours, etc.)
 * 
 * @param {Object} exception - The exception data
 * @returns {Promise<string>} - The ID of the created exception
 */
export const addScheduleException = async (exception) => {
  try {
    const doctorId = exception.doctorId;
    const exceptionRef = collection(db, `doctors/${doctorId}/exceptions`);
    
    const docRef = await addDoc(exceptionRef, {
      ...exception,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding schedule exception:', error);
    throw error;
  }
};

/**
 * Get schedule exceptions for a doctor within a date range
 * 
 * @param {string} doctorId - The doctor's ID
 * @param {Date} startDate - Start date for range
 * @param {Date} endDate - End date for range
 * @returns {Promise<Array>} - Array of exceptions
 */
export const getScheduleExceptions = async (doctorId, startDate, endDate) => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const exceptionsRef = collection(db, `doctors/${doctorId}/exceptions`);
    const q = query(
      exceptionsRef,
      where('startDate', '<=', endTimestamp),
      where('endDate', '>=', startTimestamp)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting schedule exceptions:', error);
    throw error;
  }
};

/**
 * Generate and save appointment slots for a doctor
 * 
 * @param {string} doctorId - The doctor's ID
 * @param {Array} slots - Array of slot objects to save
 * @returns {Promise<void>}
 */
export const saveAppointmentSlots = async (doctorId, slots) => {
  try {
    // Use a batch write for better performance
    const batch = db.batch();
    
    slots.forEach(slot => {
      const slotRef = doc(collection(db, `doctors/${doctorId}/slots`));
      batch.set(slotRef, {
        ...slot,
        start: Timestamp.fromDate(slot.start),
        end: Timestamp.fromDate(slot.end),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error saving appointment slots:', error);
    throw error;
  }
};

/**
 * Get available appointment slots for a doctor within a date range
 * 
 * @param {string} doctorId - The doctor's ID
 * @param {Date} startDate - Start date for range
 * @param {Date} endDate - End date for range
 * @returns {Promise<Array>} - Array of available slots
 */
export const getAvailableSlots = async (doctorId, startDate, endDate) => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const slotsRef = collection(db, `doctors/${doctorId}/slots`);
    const q = query(
      slotsRef,
      where('start', '>=', startTimestamp),
      where('start', '<=', endTimestamp),
      where('status', '==', 'free'),
      orderBy('start', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate()
    }));
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }
};

/**
 * Hold an appointment slot for a user
 * 
 * @param {string} doctorId - The doctor's ID
 * @param {string} slotId - The slot's ID
 * @param {string} userId - The user's ID
 * @param {number} holdDurationMinutes - How long to hold the slot (default: 5 minutes)
 * @returns {Promise<boolean>} - True if hold was successful
 */
export const holdAppointmentSlot = async (doctorId, slotId, userId, holdDurationMinutes = 5) => {
  try {
    const slotRef = doc(db, `doctors/${doctorId}/slots/${slotId}`);
    
    // Use a transaction to ensure atomicity
    return await runTransaction(db, async (transaction) => {
      const slotDoc = await transaction.get(slotRef);
      
      if (!slotDoc.exists()) {
        throw new Error('Slot does not exist');
      }
      
      const slotData = slotDoc.data();
      
      if (slotData.status !== 'free') {
        return false; // Slot is not available
      }
      
      // Calculate hold expiration time
      const holdExpiresAt = new Date();
      holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + holdDurationMinutes);
      
      // Update the slot
      transaction.update(slotRef, {
        status: 'held',
        heldBy: userId,
        holdExpiresAt: Timestamp.fromDate(holdExpiresAt),
        updatedAt: serverTimestamp()
      });
      
      return true;
    });
  } catch (error) {
    console.error('Error holding appointment slot:', error);
    throw error;
  }
};

/**
 * Book an appointment
 * 
 * @param {Object} appointmentData - The appointment data
 * @returns {Promise<string>} - The ID of the created appointment
 */
export const bookAppointment = async (appointmentData) => {
  try {
    const { doctorId, slotId } = appointmentData;
    const slotRef = doc(db, `doctors/${doctorId}/slots/${slotId}`);
    const appointmentsRef = collection(db, 'appointments');
    
    // Use a transaction to ensure atomicity
    return await runTransaction(db, async (transaction) => {
      const slotDoc = await transaction.get(slotRef);
      
      if (!slotDoc.exists()) {
        throw new Error('Slot does not exist');
      }
      
      const slotData = slotDoc.data();
      
      // Check if slot is available (either free or held by this user)
      if (slotData.status !== 'free' && 
          !(slotData.status === 'held' && slotData.heldBy === appointmentData.patientId)) {
        throw new Error('Slot is not available');
      }
      
      // Create a new appointment document
      const appointmentRef = doc(appointmentsRef);
      transaction.set(appointmentRef, {
        ...appointmentData,
        start: slotData.start,
        end: slotData.end,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update the slot status
      transaction.update(slotRef, {
        status: 'booked',
        appointmentId: appointmentRef.id,
        heldBy: null,
        holdExpiresAt: null,
        updatedAt: serverTimestamp()
      });
      
      return appointmentRef.id;
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

/**
 * Get appointments for a patient
 * 
 * @param {string} patientId - The patient's ID
 * @param {string} status - Optional status filter
 * @param {number} limitCount - Maximum number of appointments to return
 * @returns {Promise<Array>} - Array of appointments
 */
export const getPatientAppointments = async (patientId, status = null, limitCount = 50) => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    
    let q;
    if (status) {
      q = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        where('status', '==', status),
        orderBy('start', 'asc'),
        limit(limitCount)
      );
    } else {
      q = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        orderBy('start', 'asc'),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate()
    }));
  } catch (error) {
    console.error('Error getting patient appointments:', error);
    throw error;
  }
};

/**
 * Get appointments for a doctor
 * 
 * @param {string} doctorId - The doctor's ID
 * @param {string} status - Optional status filter
 * @param {Date} startDate - Optional start date filter
 * @param {Date} endDate - Optional end date filter
 * @param {number} limitCount - Maximum number of appointments to return
 * @returns {Promise<Array>} - Array of appointments
 */
export const getDoctorAppointments = async (doctorId, status = null, startDate = null, endDate = null, limitCount = 50) => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    
    let constraints = [
      where('doctorId', '==', doctorId),
      orderBy('start', 'asc'),
      limit(limitCount)
    ];
    
    if (status) {
      constraints.push(where('status', '==', status));
    }
    
    if (startDate && endDate) {
      constraints.push(where('start', '>=', Timestamp.fromDate(startDate)));
      constraints.push(where('start', '<=', Timestamp.fromDate(endDate)));
    }
    
    const q = query(appointmentsRef, ...constraints);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate()
    }));
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    throw error;
  }
};

/**
 * Cancel an appointment
 * 
 * @param {string} appointmentId - The appointment's ID
 * @param {string} reason - The cancellation reason
 * @param {string} userId - The user ID making the cancellation
 * @returns {Promise<void>}
 */
export const cancelAppointment = async (appointmentId, reason, userId) => {
  try {
    const appointmentRef = doc(db, `appointments/${appointmentId}`);
    
    // Use a transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      const appointmentDoc = await transaction.get(appointmentRef);
      
      if (!appointmentDoc.exists()) {
        throw new Error('Appointment does not exist');
      }
      
      const appointmentData = appointmentDoc.data();
      
      // Update the appointment
      transaction.update(appointmentRef, {
        status: 'cancelled',
        cancellationReason: reason,
        updatedAt: serverTimestamp()
      });
      
      // Add event to history
      const historyRef = collection(db, `appointments/${appointmentId}/events`);
      const historyDoc = doc(historyRef);
      
      transaction.set(historyDoc, {
        status: 'cancelled',
        timestamp: serverTimestamp(),
        userId: userId,
        note: reason || 'Appointment cancelled',
        type: 'status_change'
      });
      
      // If there's a slot associated, update it too
      if (appointmentData.slotId) {
        const slotRef = doc(db, `doctors/${appointmentData.doctorId}/slots/${appointmentData.slotId}`);
        transaction.update(slotRef, {
          status: 'free',
          appointmentId: null,
          updatedAt: serverTimestamp()
        });
      }
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

/**
 * Reschedule an appointment
 * 
 * @param {Object} rescheduleData - The reschedule data
 * @param {string} rescheduleData.appointmentId - The appointment's ID
 * @param {string} rescheduleData.oldSlotId - The old slot's ID
 * @param {string} rescheduleData.newSlotId - The new slot's ID
 * @param {string} rescheduleData.reason - The reschedule reason
 * @param {string} rescheduleData.userId - The user ID making the reschedule
 * @returns {Promise<void>}
 */
export const rescheduleAppointment = async (rescheduleData) => {
  try {
    const { appointmentId, oldSlotId, newSlotId, reason, userId } = rescheduleData;
    
    const appointmentRef = doc(db, `appointments/${appointmentId}`);
    const oldSlotRef = doc(db, `doctors/${rescheduleData.doctorId}/slots/${oldSlotId}`);
    const newSlotRef = doc(db, `doctors/${rescheduleData.doctorId}/slots/${newSlotId}`);
    
    // Use a transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      // Get the documents
      const appointmentDoc = await transaction.get(appointmentRef);
      const oldSlotDoc = await transaction.get(oldSlotRef);
      const newSlotDoc = await transaction.get(newSlotRef);
      
      if (!appointmentDoc.exists()) {
        throw new Error('Appointment does not exist');
      }
      
      if (!oldSlotDoc.exists()) {
        throw new Error('Original slot does not exist');
      }
      
      if (!newSlotDoc.exists()) {
        throw new Error('New slot does not exist');
      }
      
      const appointmentData = appointmentDoc.data();
      const newSlotData = newSlotDoc.data();
      
      // Check if new slot is available
      if (newSlotData.status !== 'free') {
        throw new Error('Selected slot is no longer available');
      }
      
      // Update the appointment
      transaction.update(appointmentRef, {
        status: 'rescheduled',
        slotId: newSlotId,
        start: newSlotData.start,
        end: newSlotData.end,
        rescheduledReason: reason,
        updatedAt: serverTimestamp()
      });
      
      // Add event to history
      const historyRef = collection(db, `appointments/${appointmentId}/events`);
      const historyDoc = doc(historyRef);
      
      transaction.set(historyDoc, {
        status: 'rescheduled',
        timestamp: serverTimestamp(),
        userId: userId,
        oldSlotId: oldSlotId,
        newSlotId: newSlotId,
        oldStart: appointmentData.start,
        newStart: newSlotData.start,
        note: reason || 'Appointment rescheduled',
        type: 'reschedule'
      });
      
      // Update the old slot
      transaction.update(oldSlotRef, {
        status: 'free',
        appointmentId: null,
        updatedAt: serverTimestamp()
      });
      
      // Update the new slot
      transaction.update(newSlotRef, {
        status: 'booked',
        appointmentId: appointmentId,
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }
};

/**
 * Clean up expired holds
 * 
 * @param {string} doctorId - The doctor's ID
 * @returns {Promise<number>} - Number of slots cleaned up
 */
export const cleanupExpiredHolds = async (doctorId) => {
  try {
    const now = new Date();
    const slotsRef = collection(db, `doctors/${doctorId}/slots`);
    const q = query(
      slotsRef,
      where('status', '==', 'held'),
      where('holdExpiresAt', '<=', Timestamp.fromDate(now))
    );
    
    const querySnapshot = await getDocs(q);
    const batch = db.batch();
    
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'free',
        heldBy: null,
        holdExpiresAt: null,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Error cleaning up expired holds:', error);
    throw error;
  }
};
