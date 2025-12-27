/**
 * Date helper utilities
 * Functions for date manipulation and calculations
 */

import type { DayInfo } from '../types';

/**
 * Generate days info for a specific month
 * @param year - Year number
 * @param month - Month number (0-indexed)
 * @returns Array of day information objects
 */
export const generateDaysInfo = (year: number, month: number): DayInfo[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const DAYS_OF_WEEK_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: DayInfo[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dayIndex = date.getDay();
    result.push({
      date: i,
      dayOfWeek: DAYS_OF_WEEK_EN[dayIndex],
      isWeekend: dayIndex === 0 || dayIndex === 6,
    });
  }
  return result;
};

/**
 * Calculate total attendance value from attendance record
 * @param attendance - Record of day number to attendance value
 * @returns Total attendance as number
 */
export const calculateAttendanceTotal = (attendance: Record<number, string>): number => {
  let total = 0;
  Object.values(attendance).forEach((val) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      total += num;
    }
  });
  return total;
};
