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
  downloadTimesheetTemplate,
  // Employee
  exportEmployeesToExcel,
  importEmployeesFromExcel,
  downloadEmployeeTemplate,
  // Target
  exportTargetsToExcel,
  exportTargetsToJSON,
  importTargetsFromJSON,
  importTargetsFromExcel,
  downloadTargetTemplate,
  // Payroll
  exportPayrollToExcel
} from './excel';
