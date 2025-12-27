/**
 * Firebase Timesheet Service
 * CRUD operations for timesheets in Firebase Realtime Database
 */
import { ref, get, set, update } from 'firebase/database'
import { db, isFirebaseAvailable } from '../../lib/firebase'
import type { Employee, Target } from '../../types'

// Helper to get database reference
const getDb = () => {
  if (!isFirebaseAvailable() || !db) {
    throw new Error('Firebase not configured. Please set up .env file.')
  }
  return db
}

export async function getTimesheet(year: number, month: number): Promise<Employee[]> {
  if (!isFirebaseAvailable()) return []

  const database = getDb()
  const snapshot = await get(ref(database, `timesheets/${year}/${month}`))
  if (!snapshot.exists()) return []

  const data = snapshot.val()
  return Object.keys(data).map(key => ({
    id: key,
    ...data[key]
  }))
}

export async function saveTimesheet(
  year: number,
  month: number,
  employeeId: string,
  data: Partial<Employee>
): Promise<void> {
  const database = getDb()
  await set(ref(database, `timesheets/${year}/${month}/${employeeId}`), data)
}

export async function saveAllTimesheets(
  year: number,
  month: number,
  employees: Employee[]
): Promise<void> {
  const database = getDb()
  const updates: Record<string, any> = {}
  employees.forEach(emp => {
    updates[`timesheets/${year}/${month}/${emp.id}`] = emp
  })
  await update(ref(database), updates)
}

/**
 * Batch import initial data to Firebase
 */
export async function importInitialData(data: {
  employees?: Record<string, Employee>
  targets?: Record<string, Target>
  timesheets?: Record<string, Record<string, Record<string, Employee>>>
}): Promise<void> {
  const database = getDb()
  const updates: Record<string, any> = {}

  if (data.employees) {
    updates['employees'] = data.employees
  }
  if (data.targets) {
    updates['targets'] = data.targets
  }
  if (data.timesheets) {
    updates['timesheets'] = data.timesheets
  }

  await update(ref(database), updates)
}
