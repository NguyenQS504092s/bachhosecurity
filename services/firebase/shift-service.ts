/**
 * Shift Service
 * CRUD operations for custom shifts in Firebase Realtime Database
 */

import { ref, get, set } from 'firebase/database';
import { db } from '../../lib/firebase';

const SHIFTS_PATH = 'settings/shifts';

// Default shift options (24h format)
export const DEFAULT_SHIFTS = [
  '06:00 - 14:00',
  '08:00 - 17:00',
  '14:00 - 22:00',
  '18:00 - 06:00',
  '22:00 - 06:00',
  '00:00 - 08:00',
  '12:00 - 20:00',
  '20:00 - 04:00'
];

/**
 * Get all custom shifts from Firebase
 */
export const getCustomShifts = async (): Promise<string[]> => {
  if (!db) {
    console.warn('[ShiftService] Firebase not available');
    return [];
  }

  try {
    const shiftsRef = ref(db, SHIFTS_PATH);
    const snapshot = await get(shiftsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Data is stored as { 0: "shift1", 1: "shift2", ... } or array
      if (Array.isArray(data)) {
        return data.filter(s => s); // filter out null/undefined
      }
      return Object.values(data).filter(s => s) as string[];
    }
    return [];
  } catch (error) {
    console.error('[ShiftService] Failed to get custom shifts:', error);
    return [];
  }
};

/**
 * Save custom shifts to Firebase
 */
export const saveCustomShifts = async (shifts: string[]): Promise<void> => {
  if (!db) {
    console.warn('[ShiftService] Firebase not available');
    return;
  }

  try {
    const shiftsRef = ref(db, SHIFTS_PATH);
    await set(shiftsRef, shifts);
    console.log('[ShiftService] Custom shifts saved:', shifts.length, 'shifts');
  } catch (error) {
    console.error('[ShiftService] Failed to save custom shifts:', error);
    throw error;
  }
};

/**
 * Add a new custom shift
 */
export const addCustomShift = async (shift: string): Promise<string[]> => {
  const currentShifts = await getCustomShifts();

  // Check if shift already exists
  if (currentShifts.includes(shift) || DEFAULT_SHIFTS.includes(shift)) {
    return currentShifts;
  }

  const updatedShifts = [...currentShifts, shift];
  await saveCustomShifts(updatedShifts);
  return updatedShifts;
};

/**
 * Remove a custom shift
 */
export const removeCustomShift = async (shift: string): Promise<string[]> => {
  const currentShifts = await getCustomShifts();
  const updatedShifts = currentShifts.filter(s => s !== shift);
  await saveCustomShifts(updatedShifts);
  return updatedShifts;
};

/**
 * Get all shifts (default + custom)
 */
export const getAllShifts = async (): Promise<string[]> => {
  const customShifts = await getCustomShifts();
  return [...DEFAULT_SHIFTS, ...customShifts];
};
