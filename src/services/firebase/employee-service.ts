/**
 * Firebase Employee Service
 * CRUD operations for employees in Firebase Realtime Database
 */
import { ref, get, set, update, remove, push } from 'firebase/database'
import { db, isFirebaseAvailable } from '../../lib/firebase'
import type { Employee } from '../../types'

// Helper to get database reference
const getDb = () => {
  if (!isFirebaseAvailable() || !db) {
    throw new Error('Firebase not configured. Please set up .env file.')
  }
  return db
}

export async function getAllEmployees(): Promise<Employee[]> {
  if (!isFirebaseAvailable()) return []

  const database = getDb()
  const snapshot = await get(ref(database, 'employees'))
  if (!snapshot.exists()) return []

  const data = snapshot.val()
  return Object.keys(data).map(key => ({
    id: key,
    attendance: {}, // Ensure attendance is always initialized
    ...data[key]
  }))
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  if (!isFirebaseAvailable()) return null

  const database = getDb()
  const snapshot = await get(ref(database, `employees/${id}`))
  if (!snapshot.exists()) return null
  return { id, attendance: {}, ...snapshot.val() }
}

export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<string> {
  const database = getDb()
  const newRef = push(ref(database, 'employees'))
  const id = newRef.key!
  await set(newRef, { ...employee, id })
  return id
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<void> {
  const database = getDb()
  await update(ref(database, `employees/${id}`), updates)
}

export async function deleteEmployee(id: string): Promise<void> {
  const database = getDb()
  await remove(ref(database, `employees/${id}`))
}
