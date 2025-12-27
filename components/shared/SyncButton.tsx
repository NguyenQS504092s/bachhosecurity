/**
 * Sync button components
 * Shows connection status, last sync time, and sync results
 */

import React from 'react'
import {
  RefreshCw,
  Check,
  AlertCircle,
  Cloud,
  CloudOff,
  Loader2
} from 'lucide-react'
import { useSheetsSync } from '../../hooks/useSheetsSync'

interface SyncStatusProps {
  onSyncComplete?: () => void
}

export function SyncStatus({ onSyncComplete }: SyncStatusProps) {
  const {
    status,
    isSyncing,
    lastSync,
    lastResult,
    error,
    isConnected,
    sync,
    resetStatus
  } = useSheetsSync()

  const handleSync = async () => {
    try {
      await sync()
      onSyncComplete?.()
    } catch (e) {
      // Error handled in hook
    }
  }

  const formatTime = (date: Date | null) => {
    if (!date) return 'Chưa đồng bộ'
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const StatusIcon = () => {
    if (isSyncing) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
    }
    if (status === 'success') {
      return <Check className="w-4 h-4 text-green-500" />
    }
    if (status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (!isConnected) {
      return <CloudOff className="w-4 h-4 text-gray-400" />
    }
    return <Cloud className="w-4 h-4 text-blue-400" />
  }

  const getStatusText = () => {
    if (isSyncing) return 'Đang đồng bộ...'
    if (status === 'success' && lastResult) {
      const { imported, updated } = lastResult
      if (imported === 0 && updated === 0) {
        return 'Không có thay đổi'
      }
      return `+${imported} mới, ${updated} cập nhật`
    }
    if (status === 'error') return 'Lỗi đồng bộ'
    if (!isConnected) return 'Không kết nối'
    return `Lần cuối: ${formatTime(lastSync)}`
  }

  return (
    <div className="flex items-center gap-2 text-sm bg-white border rounded-lg px-3 py-2 shadow-sm">
      <StatusIcon />
      <span className="text-gray-600 min-w-[120px]">
        {getStatusText()}
      </span>
      <button
        onClick={handleSync}
        disabled={isSyncing || !isConnected}
        className="
          flex items-center gap-1 px-3 py-1.5
          text-xs font-medium
          bg-blue-500 text-white rounded
          hover:bg-blue-600
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
        title="Đồng bộ từ Google Sheets"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>Sync</span>
      </button>
      {error && status === 'error' && (
        <div
          className="absolute top-full left-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 max-w-xs z-10"
          onClick={() => resetStatus()}
        >
          {error}
        </div>
      )}
    </div>
  )
}

/**
 * Compact sync button for toolbar
 */
export function SyncButton({ onSyncComplete }: SyncStatusProps) {
  const { isSyncing, isConnected, sync } = useSheetsSync()

  const handleSync = async () => {
    try {
      await sync()
      onSyncComplete?.()
    } catch (e) {
      // Error handled in hook
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing || !isConnected}
      className="
        flex items-center gap-1.5 px-3 py-2
        text-sm font-medium
        bg-green-500 text-white rounded-lg
        hover:bg-green-600
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
      "
      title="Đồng bộ dữ liệu từ Google Sheets"
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
      <span>{isSyncing ? 'Đang sync...' : 'Sync từ Sheets'}</span>
    </button>
  )
}

export default SyncStatus
