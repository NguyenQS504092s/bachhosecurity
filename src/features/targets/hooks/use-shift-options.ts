/**
 * Hook for managing shift options
 * Loads/saves custom shifts from Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SHIFTS, getCustomShifts, saveCustomShifts as saveShiftsToFirebase } from '../../../services/firebase';

export const useShiftOptions = () => {
  const [customShifts, setCustomShifts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Combined shift options (default + custom)
  const shiftOptions = [...DEFAULT_SHIFTS, ...customShifts];

  useEffect(() => {
    const loadShifts = async () => {
      try {
        const shifts = await getCustomShifts();
        setCustomShifts(shifts);
      } catch (error) {
        console.error('[useShiftOptions] Failed to load:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadShifts();
  }, []);

  const addCustomShift = useCallback(async (start: string, end: string) => {
    const newShift = `${start} - ${end}`;
    if (!shiftOptions.includes(newShift)) {
      const updated = [...customShifts, newShift];
      setCustomShifts(updated);
      await saveShiftsToFirebase(updated);
    }
  }, [customShifts, shiftOptions]);

  const removeCustomShift = useCallback(async (shift: string) => {
    const updated = customShifts.filter(s => s !== shift);
    setCustomShifts(updated);
    await saveShiftsToFirebase(updated);
  }, [customShifts]);

  const updateCustomShift = useCallback(async (oldShift: string, newShift: string) => {
    if (shiftOptions.includes(newShift) && newShift !== oldShift) {
      throw new Error('Ca này đã tồn tại!');
    }

    const isCustom = customShifts.includes(oldShift);
    let updated: string[];

    if (isCustom) {
      updated = customShifts.map(s => s === oldShift ? newShift : s);
    } else {
      // "Edit" default shift = add new custom shift
      updated = [...customShifts, newShift];
    }

    setCustomShifts(updated);
    await saveShiftsToFirebase(updated);
  }, [customShifts, shiftOptions]);

  return {
    shiftOptions,
    customShifts,
    isLoading,
    addCustomShift,
    removeCustomShift,
    updateCustomShift
  };
};
