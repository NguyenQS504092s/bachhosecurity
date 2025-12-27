/**
 * @deprecated Import from './firebase' directory instead
 * This file is kept for backward compatibility
 */

// Re-export all from new modular structure
export {
  // Employees
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  // Targets
  getAllTargets,
  getTargetById,
  createTarget,
  updateTarget,
  deleteTarget,
  // Timesheets
  getTimesheet,
  saveTimesheet,
  saveAllTimesheets,
  importInitialData
} from './firebase'
