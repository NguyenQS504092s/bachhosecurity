/**
 * Sync Service
 * Google Sheets ↔ Firebase Realtime Database sync
 * Source of truth: Google Sheets
 */

import { ref, set, get } from 'firebase/database'
import { db, isFirebaseAvailable } from '../lib/firebase'
import { readSheetData, sheetRowToEmployee, type SheetRow } from './sheets-service'
import { getAllEmployees, createEmployee, updateEmployee } from './firebase'
import type { Employee } from '../types'

// Sync result
export interface SyncResult {
  success: boolean
  timestamp: Date
  imported: number
  updated: number
  skipped: number
  errors: string[]
  duration: number
}

// Sync log entry
interface SyncLog {
  id: string
  timestamp: string
  direction: 'sheets_to_firebase' | 'firebase_to_sheets'
  result: 'success' | 'partial' | 'failed'
  imported: number
  updated: number
  errors: string[]
}

/**
 * Main sync: Pull data from Google Sheets to Firebase
 */
export async function syncFromSheets(): Promise<SyncResult> {
  const startTime = Date.now()
  const result: SyncResult = {
    success: false,
    timestamp: new Date(),
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    duration: 0
  }

  try {
    // 1. Read data from Google Sheets
    const sheetRows = await readSheetData()
    console.log(`[Sync] Read ${sheetRows.length} rows from Sheets`)

    // 2. Get current Firebase employees
    const firebaseEmployees = await getAllEmployees()
    const employeeByCode = new Map(
      firebaseEmployees.map(e => [e.code, e])
    )

    // 3. Process each sheet row
    for (const row of sheetRows) {
      if (!row.employeeCode) continue

      try {
        const sheetData = sheetRowToEmployee(row)
        const existing = employeeByCode.get(row.employeeCode)

        if (!existing) {
          // New employee
          await createEmployee({
            code: sheetData.code,
            name: sheetData.name,
            department: sheetData.department,
            shift: sheetData.shift,
            attendance: sheetData.attendance,
            role: 'staff'
          })
          result.imported++
        } else {
          // Existing employee - check for changes
          const hasChanges = hasDataChanged(existing, sheetData)

          if (hasChanges) {
            await updateEmployee(existing.id, {
              name: sheetData.name,
              department: sheetData.department,
              shift: sheetData.shift,
              attendance: sheetData.attendance
            })
            result.updated++
          } else {
            result.skipped++
          }
        }
      } catch (error) {
        result.errors.push(`Row ${row.rowIndex}: ${error}`)
      }
    }

    // 4. Log sync
    await logSync({
      direction: 'sheets_to_firebase',
      result: result.errors.length > 0 ? 'partial' : 'success',
      imported: result.imported,
      updated: result.updated,
      errors: result.errors
    })

    result.success = true
    result.duration = Date.now() - startTime
    console.log(`[Sync] Complete: ${result.imported} imported, ${result.updated} updated, ${result.skipped} skipped`)

    return result
  } catch (error) {
    result.errors.push(`Sync failed: ${error}`)
    result.duration = Date.now() - startTime

    await logSync({
      direction: 'sheets_to_firebase',
      result: 'failed',
      imported: 0,
      updated: 0,
      errors: result.errors
    })

    return result
  }
}

/**
 * Check if Sheet data differs from Firebase data
 */
function hasDataChanged(
  firebase: Employee,
  sheet: ReturnType<typeof sheetRowToEmployee>
): boolean {
  if (firebase.name !== sheet.name) return true
  if (firebase.department !== sheet.department) return true
  if (firebase.shift !== sheet.shift) return true

  const fbDays = Object.keys(firebase.attendance || {})
  const sheetDays = Object.keys(sheet.attendance || {})

  if (fbDays.length !== sheetDays.length) return true

  for (const day of sheetDays) {
    if (firebase.attendance?.[Number(day)] !== sheet.attendance[Number(day)]) {
      return true
    }
  }

  return false
}

/**
 * Log sync operation
 */
async function logSync(log: Omit<SyncLog, 'id' | 'timestamp'>): Promise<void> {
  if (!isFirebaseAvailable() || !db) {
    console.log('[Sync] Log skipped - Firebase not configured')
    return
  }

  try {
    const logId = Date.now().toString()
    const logRef = ref(db, `sync_logs/${logId}`)

    await set(logRef, {
      id: logId,
      timestamp: new Date().toISOString(),
      ...log
    })
  } catch (error) {
    console.error('Failed to log sync:', error)
  }
}

/**
 * Get recent sync logs
 */
export async function getSyncLogs(limit: number = 10): Promise<SyncLog[]> {
  if (!isFirebaseAvailable() || !db) return []

  try {
    const logsRef = ref(db, 'sync_logs')
    const snapshot = await get(logsRef)

    if (!snapshot.exists()) return []

    const data = snapshot.val()
    const logs: SyncLog[] = Object.keys(data)
      .map(key => data[key])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return logs
  } catch (error) {
    console.error('Failed to get sync logs:', error)
    return []
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<Date | null> {
  const logs = await getSyncLogs(1)
  if (logs.length === 0) return null
  return new Date(logs[0].timestamp)
}

/**
 * Clear all sync logs
 */
export async function clearSyncLogs(): Promise<void> {
  if (!isFirebaseAvailable() || !db) return

  try {
    await set(ref(db, 'sync_logs'), null)
  } catch (error) {
    console.error('Failed to clear sync logs:', error)
    throw error
  }
}
