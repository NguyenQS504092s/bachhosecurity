/**
 * @deprecated Import from './excel' directory instead
 * This file is kept for backward compatibility
 */

// Re-export all from new modular structure
export {
  // Timesheet
  exportToExcel,
  exportToExcelStyled,
  importTimesheetFromExcel,
  // Employee
  exportEmployeesToExcel,
  importEmployeesFromExcel,
  // Target
  exportTargetsToExcel,
  exportTargetsToJSON,
  importTargetsFromJSON,
  importTargetsFromExcel,
  // Payroll
  exportPayrollToExcel
} from './excel';
