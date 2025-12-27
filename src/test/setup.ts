import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Firebase packages BEFORE any imports
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({}))
}))

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn(() => ({})),
  get: vi.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
  set: vi.fn(() => Promise.resolve()),
  update: vi.fn(() => Promise.resolve()),
  remove: vi.fn(() => Promise.resolve()),
  push: vi.fn(() => ({ key: 'mock-id' })),
  child: vi.fn(() => ({}))
}))

// Mock the lib/firebase module
vi.mock('../lib/firebase', () => ({
  app: null,
  db: null,
  isFirebaseAvailable: vi.fn(() => false),
  getFirebaseError: vi.fn(() => null)
}))

// Mock Firebase realtime-database-service
vi.mock('../services/realtime-database-service', () => ({
  getAllEmployees: vi.fn().mockResolvedValue([]),
  getEmployeeById: vi.fn().mockResolvedValue(null),
  createEmployee: vi.fn().mockResolvedValue('mock-id'),
  updateEmployee: vi.fn().mockResolvedValue(undefined),
  deleteEmployee: vi.fn().mockResolvedValue(undefined),
  getAllTargets: vi.fn().mockResolvedValue([]),
  getTargetById: vi.fn().mockResolvedValue(null),
  createTarget: vi.fn().mockResolvedValue('mock-id'),
  updateTarget: vi.fn().mockResolvedValue(undefined),
  deleteTarget: vi.fn().mockResolvedValue(undefined),
  getTimesheet: vi.fn().mockResolvedValue([]),
  saveTimesheet: vi.fn().mockResolvedValue(undefined),
  saveAllTimesheets: vi.fn().mockResolvedValue(undefined),
  importInitialData: vi.fn().mockResolvedValue(undefined)
}))

// Mock sheets service
vi.mock('../services/sheetsService', () => ({
  readSheetData: vi.fn().mockResolvedValue([]),
  getSheetMetadata: vi.fn().mockResolvedValue({ title: 'Test', headers: [], rowCount: 0 }),
  sheetRowToEmployee: vi.fn().mockImplementation(row => row),
  testSheetsConnection: vi.fn().mockResolvedValue({ success: true, message: 'OK' })
}))

// Mock sync service
vi.mock('../services/syncService', () => ({
  syncFromSheets: vi.fn().mockResolvedValue({
    success: true,
    timestamp: new Date(),
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    duration: 0
  }),
  getSyncLogs: vi.fn().mockResolvedValue([]),
  getLastSyncTime: vi.fn().mockResolvedValue(null)
}))

// Mock backup service
vi.mock('../services/backupService', () => ({
  exportAsJson: vi.fn().mockResolvedValue(new Blob(['{}'], { type: 'application/json' })),
  downloadBackup: vi.fn(),
  createAndDownloadBackup: vi.fn().mockResolvedValue(undefined)
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
