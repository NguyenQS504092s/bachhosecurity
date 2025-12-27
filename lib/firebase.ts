/**
 * Firebase Realtime Database initialization
 * Uses environment variables for configuration
 * Gracefully degrades if config is missing (app works with local data only)
 */
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'

// Hardcoded config with fallbacks for production deployment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDxfBzknZibS5e96YZZhxL7Rm2R00FQO7k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'bachho-timesheet-2025.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://bachho-timesheet-2025-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'bachho-timesheet-2025',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'bachho-timesheet-2025.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '254498018198',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:254498018198:web:dfbdc63a710b8b37f2c3b7',
}

// Check if essential config is present
const isConfigValid = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId
)

// Initialize Firebase (only if config is valid)
let app: FirebaseApp | null = null
let db: Database | null = null
let firebaseError: string | null = null

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig)
    db = getDatabase(app)
  } catch (error) {
    console.error('Firebase initialization error:', error)
    firebaseError = error instanceof Error ? error.message : 'Unknown error'
  }
} else {
  console.warn(
    '⚠️ Firebase not configured. App will work with local data only.\n' +
    'To enable Firebase, add these to your .env file:\n' +
    '  VITE_FIREBASE_API_KEY=...\n' +
    '  VITE_FIREBASE_DATABASE_URL=...\n' +
    '  VITE_FIREBASE_PROJECT_ID=...'
  )
}

// Helper to check if Firebase is available
export const isFirebaseAvailable = (): boolean => db !== null

// Get Firebase error message if any
export const getFirebaseError = (): string | null => firebaseError

export { app, db }
