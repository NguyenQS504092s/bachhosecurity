/**
 * HR Helper Functions
 * Utilities for employee statistics and calculations
 */

import type { Employee } from '../../types';

export interface EmployeeStats {
  totalDays: number;
  totalWork: number;
  halfDays: number;
  leaveDays: number;
  weekendDays: number;
  emptyDays: number;
}

/**
 * Calculate attendance statistics for an employee
 */
export const calculateEmployeeStats = (
  emp: Employee,
  gridData: Employee[],
  month: number,
  year: number
): EmployeeStats => {
  // Find employee in gridData by code
  const gridEmployee = gridData.find(e => e.code === emp.code);
  if (!gridEmployee || !gridEmployee.attendance) {
    return {
      totalDays: 0,
      totalWork: 0,
      halfDays: 0,
      leaveDays: 0,
      weekendDays: 0,
      emptyDays: 0
    };
  }

  const attendance = gridEmployee.attendance;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let totalWork = 0;
  let halfDays = 0;
  let leaveDays = 0;
  let weekendDays = 0;
  let emptyDays = 0;
  let totalDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const value = attendance[day] || '';

    if (value === 'CN' || value === 'Red') {
      weekendDays++;
    } else if (value === 'P') {
      leaveDays++;
    } else if (value === '0.5') {
      halfDays++;
      totalWork += 0.5;
    } else if (value === '1') {
      totalWork += 1;
      totalDays++;
    } else if (value === '') {
      if (isWeekend) {
        weekendDays++;
      } else {
        emptyDays++;
      }
    } else {
      // Try to parse as number
      const num = parseFloat(value);
      if (!isNaN(num)) {
        totalWork += num;
        if (num === 1) totalDays++;
        else if (num === 0.5) halfDays++;
      }
    }
  }

  return {
    totalDays,
    totalWork: Math.round(totalWork * 100) / 100,
    halfDays,
    leaveDays,
    weekendDays,
    emptyDays
  };
};

/**
 * Calculate payroll for an employee
 */
export const calculatePayroll = (
  emp: Employee,
  stats: EmployeeStats
) => {
  const dailyRate = emp.dailyRate || 200000;
  const bonus = emp.bonus || 0;
  const penalty = emp.penalty || 0;
  const baseSalary = stats.totalWork * dailyRate;
  const totalSalary = baseSalary + bonus - penalty;

  return {
    dailyRate,
    bonus,
    penalty,
    baseSalary,
    totalSalary
  };
};

/**
 * Get cell color for attendance value
 */
export const getAttendanceCellColor = (val: string, isWeekend: boolean): string => {
  if (val === 'CN' || val === 'Red') return 'bg-red-600 text-white font-bold';
  if (val === '0.5') return 'bg-blue-100 text-blue-800';
  if (val === '1') return isWeekend ? 'bg-yellow-200' : 'bg-green-100';
  if (val === 'P') return 'bg-orange-200';
  if (!val && isWeekend) return 'bg-yellow-50';
  return 'bg-white';
};
