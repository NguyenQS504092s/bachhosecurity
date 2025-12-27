/**
 * React hook for Google Sheets ↔ Firebase sync
 * Provides sync state and manual sync trigger
 */

import { useState, useCallback, useEffect } from 'react'
import { syncFromSheets, getLastSyncTime, getSyncLogs, type SyncResult } from '../services/sync-service'
import { testSheetsConnection } from '../services/sheets-service'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'disconnected'

interface SyncState {
  status: SyncStatus
  isSyncing: boolean
  lastSync: Date | null
  lastResult: SyncResult | null
  error: string | null
  isConnected: boolean
}

export function useSheetsSync() {
  const [state, setState] = useState<SyncState>({
    status: 'idle',
    isSyncing: false,
    lastSync: null,
    lastResult: null,
    error: null,
    isConnected: false
  })

  useEffect(() => {
    checkConnection()
    loadLastSyncTime()
  }, [])

  const checkConnection = useCallback(async () => {
    try {
      const result = await testSheetsConnection()
      setState(s => ({
        ...s,
        isConnected: result.success,
        status: result.success ? 'idle' : 'disconnected',
        error: result.success ? null : result.message
      }))
      return result.success
    } catch (error) {
      setState(s => ({
        ...s,
        isConnected: false,
        status: 'disconnected',
        error: 'Cannot connect to Google Sheets'
      }))
      return false
    }
  }, [])

  const loadLastSyncTime = useCallback(async () => {
    try {
      const lastSync = await getLastSyncTime()
      setState(s => ({ ...s, lastSync }))
    } catch (error) {
      console.error('Failed to load last sync time:', error)
    }
  }, [])

  const sync = useCallback(async (): Promise<SyncResult> => {
    setState(s => ({
      ...s,
      status: 'syncing',
      isSyncing: true,
      error: null
    }))

    try {
      const result = await syncFromSheets()

      setState(s => ({
        ...s,
        status: result.success ? 'success' : 'error',
        isSyncing: false,
        lastSync: result.timestamp,
        lastResult: result,
        error: result.errors.length > 0 ? result.errors[0] : null
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed'

      setState(s => ({
        ...s,
        status: 'error',
        isSyncing: false,
        error: errorMessage
      }))

      throw error
    }
  }, [])

  const resetStatus = useCallback(() => {
    setState(s => ({
      ...s,
      status: s.isConnected ? 'idle' : 'disconnected',
      error: null
    }))
  }, [])

  const getSyncHistory = useCallback(async (limit: number = 5) => {
    return getSyncLogs(limit)
  }, [])

  return {
    ...state,
    sync,
    checkConnection,
    resetStatus,
    getSyncHistory,
    refreshLastSync: loadLastSyncTime
  }
}

export type UseSheetsSync = ReturnType<typeof useSheetsSync>
