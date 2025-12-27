/**
 * Timesheet domain types
 * Calendar and attendance-related types
 */

import type { Employee } from './employee';

export interface DayInfo {
  date: number;
  dayOfWeek: string;
  isWeekend: boolean;
}

export type CellValue = string;

export interface AppState {
  month: number;
  year: number;
  employees: Employee[];
}
