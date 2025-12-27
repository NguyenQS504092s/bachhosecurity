/**
 * Timesheet Toolbar Component
 * Contains action buttons and selection info
 */

import React, { useRef, useEffect, useState } from 'react';
import { Plus, Trash2, Copy, ChevronDown } from 'lucide-react';
import type { Target, Employee } from '../../types';

export interface TimesheetToolbarProps {
  totalAttendance: number;
  selectedCount: number;
  hasSelection: boolean;
  targets: Target[];
  allEmployees: Employee[];
  gridData: Employee[];
  onDeleteSelected: () => void;
  onCopySelection: () => void;
  onAddNewRow: () => void;
  onAddTargetRows: (target: Target) => void;
}

export const TimesheetToolbar: React.FC<TimesheetToolbarProps> = ({
  totalAttendance,
  selectedCount,
  hasSelection,
  targets,
  allEmployees,
  gridData,
  onDeleteSelected,
  onCopySelection,
  onAddNewRow,
  onAddTargetRows,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle adding target rows with duplicate check
  const handleAddTargetRows = (target: Target) => {
    let duplicateCount = 0;
    let addableCount = 0;

    target.roster.forEach(rosterItem => {
      const empDetails = allEmployees.find(e => e.id === rosterItem.employeeId);
      if (empDetails) {
        const isAlreadyInGrid = gridData.some(d => d.code === empDetails.code);
        if (isAlreadyInGrid) {
          duplicateCount++;
        } else {
          addableCount++;
        }
      }
    });

    if (addableCount === 0) {
      if (duplicateCount > 0) {
        alert(`Không thể thêm: Tất cả ${duplicateCount} nhân sự trong mục tiêu "${target.name}" đã có mặt trong bảng chấm công.`);
      } else {
        alert(`Mục tiêu "${target.name}" chưa có nhân sự nào được gán trong phần Quản Lý Mục Tiêu.`);
      }
      setShowDropdown(false);
      return;
    }

    onAddTargetRows(target);
    setShowDropdown(false);
  };

  return (
    <div className="flex justify-between items-center p-2 bg-white border-b">
      <div className="flex items-center space-x-2">
        <span className="font-bold text-gray-700">
          Tổng Số: {totalAttendance} công
        </span>

        {/* Delete selected rows button */}
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onDeleteSelected}
            className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition ml-4 border border-red-200"
          >
            <Trash2 size={14} className="mr-1" /> Xóa {selectedCount} dòng đã chọn
          </button>
        )}

        {/* Cell selection actions */}
        {hasSelection && (
          <div className="flex items-center space-x-1 ml-4 pl-4 border-l">
            <button
              onClick={onCopySelection}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center"
              title="Ctrl+C"
            >
              <Copy size={12} className="mr-1" /> Copy
            </button>
          </div>
        )}
      </div>

      {/* Add employee dropdown */}
      <div className="flex space-x-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <Plus size={16} className="mr-1" /> Thêm NV <ChevronDown size={14} className="ml-1" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border ring-1 ring-black ring-opacity-5 py-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b uppercase">
                Thêm từ Mục Tiêu
              </div>
              {targets.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleAddTargetRows(t)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {t.name} <span className="text-xs text-gray-400">({t.roster.length} NV)</span>
                </button>
              ))}
              <div className="border-t my-1"></div>
              <button
                onClick={() => {
                  onAddNewRow();
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 italic"
              >
                + Thêm dòng trống
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
