/**
 * Firebase Target Service
 * CRUD operations for targets in Firebase Realtime Database
 */
import { ref, get, set, update, remove, push } from 'firebase/database'
import { db, isFirebaseAvailable } from '../../lib/firebase'
import type { Target } from '../../types'

// Helper to get database reference
const getDb = () => {
  if (!isFirebaseAvailable() || !db) {
    throw new Error('Firebase not configured. Please set up .env file.')
  }
  return db
}

export async function getAllTargets(): Promise<Target[]> {
  if (!isFirebaseAvailable()) return []

  const database = getDb()
  const snapshot = await get(ref(database, 'targets'))
  if (!snapshot.exists()) return []

  const data = snapshot.val()
  return Object.keys(data).map(key => ({
    id: key,
    ...data[key],
    roster: data[key].roster ? Object.values(data[key].roster) : []
  }))
}

export async function getTargetById(id: string): Promise<Target | null> {
  if (!isFirebaseAvailable()) return null

  const database = getDb()
  const snapshot = await get(ref(database, `targets/${id}`))
  if (!snapshot.exists()) return null
  const data = snapshot.val()
  return {
    id,
    ...data,
    roster: data.roster ? Object.values(data.roster) : []
  }
}

export async function createTarget(target: Omit<Target, 'id'>): Promise<string> {
  const database = getDb()
  const newRef = push(ref(database, 'targets'))
  const id = newRef.key!
  await set(newRef, { ...target, id })
  return id
}

export async function updateTarget(id: string, updates: Partial<Target>): Promise<void> {
  const database = getDb()
  await update(ref(database, `targets/${id}`), updates)
}

export async function deleteTarget(id: string): Promise<void> {
  const database = getDb()
  await remove(ref(database, `targets/${id}`))
}
