/**
 * Timesheet Helper Functions
 * Common utilities for timesheet calculations and styling
 */

import type { Employee, DayInfo, Target } from '../types';
import { DAYS_OF_WEEK_EN } from '../constants';

/**
 * Generate day info for a specific month
 */
export const generateDaysInfo = (year: number, month: number): DayInfo[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: DayInfo[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon...
    result.push({
      date: i,
      dayOfWeek: DAYS_OF_WEEK_EN[dayIndex],
      isWeekend: dayIndex === 0 || dayIndex === 6,
    });
  }
  return result;
};

/**
 * Calculate total attendance from attendance record
 */
export const calculateTotal = (attendance?: Record<number, string>): number => {
  if (!attendance) return 0;
  let total = 0;
  Object.values(attendance).forEach((val) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      total += num;
    }
  });
  return total;
};

/**
 * Get cell background color based on value and weekend status
 */
export const getCellColor = (val: string, isWeekend: boolean): string => {
  if (val === 'CN' || val === 'Red') return 'bg-red-600 text-white font-bold';
  if (val === '0.5') return 'bg-blue-100 text-blue-800';
  if (val === '1') return isWeekend ? 'bg-yellow-200' : 'bg-green-100';
  if (val === 'P') return 'bg-orange-200';
  if (!val && isWeekend) return 'bg-yellow-50';
  return 'bg-white';
};

/**
 * Sort employees by target order
 */
export const sortByTargetOrder = (
  data: Employee[],
  targets: Target[],
  allEmployees: Employee[]
): Employee[] => {
  // Create a map: employeeCode -> { targetIndex, rosterIndex }
  const employeeTargetMap = new Map<string, { targetIndex: number; rosterIndex: number }>();

  targets.forEach((target, targetIndex) => {
    target.roster.forEach((rosterItem, rosterIndex) => {
      const emp = allEmployees.find(e => e.id === rosterItem.employeeId);
      if (emp && emp.code) {
        employeeTargetMap.set(emp.code, {
          targetIndex,
          rosterIndex
        });
      }
    });
  });

  // Sort data
  const sorted = [...data].sort((a, b) => {
    const targetInfoA = a.code ? employeeTargetMap.get(a.code) : undefined;
    const targetInfoB = b.code ? employeeTargetMap.get(b.code) : undefined;

    // Both employees are in targets
    if (targetInfoA && targetInfoB) {
      // Different targets - sort by target order
      if (targetInfoA.targetIndex !== targetInfoB.targetIndex) {
        return targetInfoA.targetIndex - targetInfoB.targetIndex;
      }
      // Same target - sort by roster order
      return targetInfoA.rosterIndex - targetInfoB.rosterIndex;
    }

    // Only A is in a target
    if (targetInfoA) return -1;

    // Only B is in a target
    if (targetInfoB) return 1;

    // Neither is in a target - sort by ID for stability (prevent reordering while typing)
    return (a.id || '').localeCompare(b.id || '');
  });

  return sorted;
};

/**
 * Column widths for sticky positioning
 */
export const COL_WIDTHS = {
  CHECK: 40,
  STT: 40,
  CODE: 70,
  NAME: 180,
  TARGET: 150
} as const;

/**
 * Calculate sticky positions for columns
 */
export const getStickyPositions = () => {
  const POS_CHECK = 0;
  const POS_STT = COL_WIDTHS.CHECK;
  const POS_CODE = POS_STT + COL_WIDTHS.STT;
  const POS_NAME = POS_CODE + COL_WIDTHS.CODE;
  const POS_TARGET = POS_NAME + COL_WIDTHS.NAME;

  return {
    CHECK: POS_CHECK,
    STT: POS_STT,
    CODE: POS_CODE,
    NAME: POS_NAME,
    TARGET: POS_TARGET
  };
};

/**
 * Create empty rows for target roster
 */
export const createRowsFromTarget = (
  target: Target,
  allEmployees: Employee[],
  existingCodes: string[]
): Employee[] => {
  const newRows: Employee[] = [];

  target.roster.forEach(rosterItem => {
    const empDetails = allEmployees.find(e => e.id === rosterItem.employeeId);

    if (empDetails) {
      // Check if employee already exists in grid
      const isAlreadyInGrid = existingCodes.some(c => c === empDetails.code);

      if (!isAlreadyInGrid) {
        const rowId = Math.random().toString(36).substr(2, 9);
        newRows.push({
          id: rowId,
          code: empDetails.code,
          name: empDetails.name,
          department: target.name,
          shift: '',
          attendance: {},
          password: '',
          role: 'staff'
        });
      }
    }
  });

  return newRows;
};
