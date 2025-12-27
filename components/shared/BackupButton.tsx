/**
 * Backup button component
 * Exports all data to downloadable JSON file
 */

import React, { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { createAndDownloadBackup } from '../../services/backup-service'

export function BackupButton() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBackup = async () => {
    setIsExporting(true)
    setError(null)

    try {
      await createAndDownloadBackup()
    } catch (err) {
      console.error('Backup failed:', err)
      setError('Không thể tạo backup. Vui lòng thử lại.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleBackup}
        disabled={isExporting}
        className="
          flex items-center gap-1.5 px-3 py-2
          text-sm font-medium
          bg-orange-500 text-white rounded-lg
          hover:bg-orange-600
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
        title="Tải xuống backup dữ liệu (JSON)"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{isExporting ? 'Đang xuất...' : 'Backup'}</span>
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  )
}

export default BackupButton
