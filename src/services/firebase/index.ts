/**
 * Firebase services barrel export
 * Re-exports all Firebase-related services
 */

// Employee operations
export {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from './employee-service'

// Target operations
export {
  getAllTargets,
  getTargetById,
  createTarget,
  updateTarget,
  deleteTarget
} from './target-service'

// Timesheet operations
export {
  getTimesheet,
  saveTimesheet,
  saveAllTimesheets,
  importInitialData
} from './timesheet-service'

// Shift operations
export {
  DEFAULT_SHIFTS,
  getCustomShifts,
  saveCustomShifts,
  addCustomShift,
  removeCustomShift,
  getAllShifts
} from './shift-service'
