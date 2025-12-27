/**
 * Services barrel export
 * Re-exports all service functions
 */

// Firebase services
export * from './firebase'

// Google Sheets service
export {
  readSheetData,
  sheetRowToEmployee,
  hasApiKey,
  getSheetMetadata,
  testSheetsConnection
} from './sheets-service'
export type { SheetRow, SheetMetadata } from './sheets-service'

// Gemini AI service
export { analyzeTimesheet, autoFillData, testApiConnection } from './gemini-service'

// Sync service
export {
  syncFromSheets,
  getSyncLogs,
  getLastSyncTime,
  clearSyncLogs
} from './sync-service'
export type { SyncResult } from './sync-service'

// Backup service
export { exportAsJson, downloadBackup, createAndDownloadBackup } from './backup-service'
