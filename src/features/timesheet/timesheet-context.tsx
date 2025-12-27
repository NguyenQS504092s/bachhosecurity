/**
 * Timesheet Context
 * Manages timesheet grid data, year/month selection
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTimesheet, saveAllTimesheets } from '../../services/realtime-database-service';
import { useEmployees } from '../hr';
import type { Employee } from '../../types';

interface TimesheetContextType {
  gridData: Employee[];
  year: number;
  month: number;
  isLoading: boolean;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  setGridData: React.Dispatch<React.SetStateAction<Employee[]>>;
  updateAttendance: (employeeId: string, day: number, value: string) => void;
  saveTimesheet: () => Promise<void>;
  refreshTimesheet: () => Promise<void>;
}

const TimesheetContext = createContext<TimesheetContextType | null>(null);

export const useTimesheet = () => {
  const context = useContext(TimesheetContext);
  if (!context) throw new Error('useTimesheet must be used within TimesheetProvider');
  return context;
};

export const TimesheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { employees, isLoading: employeesLoading } = useEmployees();
  const [gridData, setGridData] = useState<Employee[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [isLoading, setIsLoading] = useState(false);

  const loadTimesheet = useCallback(async () => {
    if (employees.length === 0) return;

    setIsLoading(true);
    try {
      const timesheetData = await getTimesheet(year, month + 1);
      const merged = employees.map(emp => {
        const ts = timesheetData.find((t: any) => t.employeeId === emp.id || t.id === emp.id);
        return { ...emp, attendance: ts?.attendance || {} };
      });
      setGridData(merged);
    } catch (err) {
      console.error('[TimesheetContext] Failed to load:', err);
    } finally {
      setIsLoading(false);
    }
  }, [year, month, employees]);

  // Load timesheet when employees loaded or month/year changes
  useEffect(() => {
    if (!employeesLoading && employees.length > 0) {
      loadTimesheet();
    }
  }, [loadTimesheet, employeesLoading, employees.length]);

  const updateAttendance = useCallback((employeeId: string, day: number, value: string) => {
    setGridData(prev => prev.map(emp =>
      emp.id === employeeId
        ? { ...emp, attendance: { ...emp.attendance, [day]: value } }
        : emp
    ));
  }, []);

  const saveTimesheet = useCallback(async () => {
    await saveAllTimesheets(year, month + 1, gridData);
  }, [year, month, gridData]);

  const refreshTimesheet = useCallback(async () => {
    await loadTimesheet();
  }, [loadTimesheet]);

  return (
    <TimesheetContext.Provider value={{
      gridData,
      year,
      month,
      isLoading: isLoading || employeesLoading,
      setYear,
      setMonth,
      setGridData,
      updateAttendance,
      saveTimesheet,
      refreshTimesheet
    }}>
      {children}
    </TimesheetContext.Provider>
  );
};
