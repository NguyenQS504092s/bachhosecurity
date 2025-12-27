/**
 * Backup Service
 * Creates downloadable JSON backups from Firebase Realtime Database
 */

import { getAllEmployees, getAllTargets } from './firebase'
import { isFirebaseAvailable } from '../lib/firebase'

interface BackupData {
  exportedAt: string
  version: string
  data: {
    employees: any[]
    targets: any[]
  }
}

/**
 * Create a full backup as JSON Blob
 */
export async function exportAsJson(): Promise<Blob> {
  const [employees, targets] = await Promise.all([
    getAllEmployees(),
    getAllTargets()
  ])

  const backup: BackupData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    data: {
      employees,
      targets
    }
  }

  return new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: 'application/json' }
  )
}

/**
 * Trigger browser download of backup file
 */
export function downloadBackup(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `bachho-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * One-click backup: export and download
 */
export async function createAndDownloadBackup(): Promise<void> {
  const blob = await exportAsJson()
  downloadBackup(blob)
}
