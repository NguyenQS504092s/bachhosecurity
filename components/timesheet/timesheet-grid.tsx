/**
 * TimesheetGrid Component (Modular Version)
 * Main timesheet grid with cell selection, autocomplete, and CRUD operations
 */

import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Trash2, CheckSquare, Square } from 'lucide-react';
import type { Employee, Target } from '../../types';
import { useCellSelection } from '../../hooks/use-cell-selection';
import { useAutocomplete } from '../../hooks/use-autocomplete';
import { AddEmployeeModal } from './add-employee-modal';
import { TimesheetToolbar } from './timesheet-toolbar';
import {
  generateDaysInfo,
  calculateTotal,
  getCellColor,
  sortByTargetOrder,
  getStickyPositions,
  COL_WIDTHS,
  createRowsFromTarget
} from '../../utils/timesheet-helpers';

interface TimesheetGridProps {
  year: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  data: Employee[];
  targets: Target[];
  allEmployees: Employee[];
  onDataChange: (newData: Employee[]) => void;
}

export const TimesheetGrid: React.FC<TimesheetGridProps> = ({
  year,
  month,
  data,
  targets,
  allEmployees,
  onDataChange
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  // Generate days for the month
  const days = useMemo(() => generateDaysInfo(year, month), [year, month]);

  // Sorted data by target order
  const sortedData = useMemo(
    () => sortByTargetOrder(data, targets, allEmployees),
    [data, targets, allEmployees]
  );

  // Sticky positions
  const stickyPos = useMemo(() => getStickyPositions(), []);

  // Cell selection hook
  const cellSelection = useCellSelection({
    data: sortedData,
    days,
    onDataChange: (newSortedData) => {
      // Map sorted data back to original order for state update
      const idMap = new Map(newSortedData.map(e => [e.id, e]));
      const newData = data.map(e => idMap.get(e.id) || e);
      onDataChange(newData);
    }
  });

  // Autocomplete hook
  const autocomplete = useAutocomplete({
    allEmployees,
    data,
    onDataChange
  });

  // Handle cell value change
  const handleCellChange = useCallback((empId: string, day: number, value: string) => {
    const newData = data.map((emp) => {
      if (emp.id === empId) {
        return {
          ...emp,
          attendance: {
            ...emp.attendance,
            [day]: value,
          },
        };
      }
      return emp;
    });
    onDataChange(newData);
  }, [data, onDataChange]);

  // Handle employee info change
  const handleInfoChange = useCallback((empId: string, field: keyof Employee, value: string) => {
    const newData = data.map((emp) => {
      if (emp.id === empId) {
        return { ...emp, [field]: value };
      }
      return emp;
    });
    onDataChange(newData);
  }, [data, onDataChange]);

  // Clear single cell
  const clearCell = useCallback((empId: string, day: number) => {
    handleCellChange(empId, day, '');
  }, [handleCellChange]);

  // Row selection handlers
  const toggleSelectAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRowIds.size === data.length && data.length > 0) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(data.map(d => d.id)));
    }
  }, [data.length, selectedRowIds.size]);

  const toggleRowSelection = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedRowIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRowIds(newSet);
  }, [selectedRowIds]);

  const deleteSelectedRows = useCallback(() => {
    if (selectedRowIds.size === 0) return;
    const remainingEmployees = data.filter(emp => !selectedRowIds.has(emp.id));
    onDataChange(remainingEmployees);
    setSelectedRowIds(new Set());
  }, [data, onDataChange, selectedRowIds]);

  // Remove single row
  const removeRow = useCallback((id: string) => {
    onDataChange(data.filter(e => e.id !== id));
  }, [data, onDataChange]);

  // Add employee from modal
  const handleAddEmployee = useCallback((newEmployee: Employee) => {
    onDataChange([...data, newEmployee]);
  }, [data, onDataChange]);

  // Add rows from target
  const handleAddTargetRows = useCallback((target: Target) => {
    const existingCodes = data.map(e => e.code);
    const newRows = createRowsFromTarget(target, allEmployees, existingCodes);

    if (newRows.length > 0) {
      onDataChange([...data, ...newRows]);
    }
  }, [data, allEmployees, onDataChange]);

  // Total attendance
  const totalAttendance = useMemo(
    () => data.reduce((acc, emp) => acc + calculateTotal(emp.attendance), 0),
    [data]
  );

  return (
    <div className="flex flex-col h-full bg-gray-100 border rounded-lg shadow-xl overflow-hidden select-none">
      {/* Toolbar */}
      <TimesheetToolbar
        totalAttendance={totalAttendance}
        selectedCount={selectedRowIds.size}
        hasSelection={cellSelection.selection !== null}
        targets={targets}
        allEmployees={allEmployees}
        gridData={data}
        onDeleteSelected={deleteSelectedRows}
        onCopySelection={cellSelection.copySelection}
        onAddNewRow={() => setShowAddModal(true)}
        onAddTargetRows={handleAddTargetRows}
      />

      {/* Table Container */}
      <div className="flex-1 overflow-auto relative bg-white" ref={tableRef}>
        <table className="border-collapse w-full min-w-max text-sm">
          <thead className="sticky top-0 z-20">
            {/* Header Row 1: Dates */}
            <tr className="bg-[#0070c0] text-white">
              <th
                className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1 text-center cursor-pointer select-none"
                style={{ left: stickyPos.CHECK, width: COL_WIDTHS.CHECK }}
                onClick={toggleSelectAll}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {data.length > 0 && selectedRowIds.size === data.length ? <CheckSquare size={16} /> : <Square size={16} />}
                </div>
              </th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1" style={{ left: stickyPos.STT, width: COL_WIDTHS.STT }}>STT</th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1" style={{ left: stickyPos.CODE, width: COL_WIDTHS.CODE }}>Mã</th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1" style={{ left: stickyPos.NAME, width: COL_WIDTHS.NAME }}>Họ Và Tên</th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1" style={{ left: stickyPos.TARGET, width: COL_WIDTHS.TARGET }}>Mục Tiêu</th>
              {days.map((day) => (
                <th
                  key={`date-${day.date}`}
                  className="w-10 border border-gray-400 p-1 text-center font-normal bg-[#0070c0]"
                >
                  {day.date.toString().padStart(2, '0')}
                </th>
              ))}
              <th className="w-16 border border-gray-400 bg-[#0070c0] p-1">Tổng</th>
              <th className="w-10 border border-gray-400 bg-[#0070c0] p-1">Xóa</th>
            </tr>
            {/* Header Row 2: Days of Week */}
            <tr className="bg-[#ffc000] text-black">
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{ left: stickyPos.CHECK }}></th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{ left: stickyPos.STT }}></th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{ left: stickyPos.CODE }}></th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{ left: stickyPos.NAME }}></th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{ left: stickyPos.TARGET }}></th>
              {days.map((day) => (
                <th
                  key={`day-${day.date}`}
                  className={`border border-gray-400 p-0 text-center text-xs font-semibold h-6 ${day.isWeekend ? 'bg-yellow-400' : 'bg-[#0070c0] text-white'
                    }`}
                >
                  {day.dayOfWeek}
                </th>
              ))}
              <th className="border border-gray-400 bg-[#0070c0] h-6"></th>
              <th className="border border-gray-400 bg-[#0070c0] h-6"></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((emp, rIdx) => {
              const codeFieldKey = `${emp.id}-code`;
              const nameFieldKey = `${emp.id}-name`;
              const isCodeActive = autocomplete.isFieldActive(emp.id, 'code');
              const isNameActive = autocomplete.isFieldActive(emp.id, 'name');

              return (
                <tr
                  key={emp.id}
                  className={`group ${hoveredRow === emp.id ? 'bg-blue-50' : 'bg-white'}`}
                  onMouseEnter={() => setHoveredRow(emp.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Checkbox */}
                  <td
                    className="sticky z-10 border border-gray-300 bg-white p-0 text-center cursor-pointer select-none"
                    style={{ left: stickyPos.CHECK }}
                    onClick={(e) => toggleRowSelection(emp.id, e)}
                  >
                    <div className="w-full h-full flex items-center justify-center hover:bg-blue-100">
                      {selectedRowIds.has(emp.id) ?
                        <CheckSquare size={16} className="text-blue-600" /> :
                        <Square size={16} className="text-gray-300 group-hover:text-gray-400" />
                      }
                    </div>
                  </td>
                  {/* STT */}
                  <td className="sticky z-10 border border-gray-300 bg-white p-1 text-center font-medium text-gray-500" style={{ left: stickyPos.STT }}>
                    {rIdx + 1}
                  </td>
                  {/* Code with autocomplete */}
                  <td className="sticky z-10 border border-gray-300 bg-white p-0 relative" style={{ left: stickyPos.CODE }}>
                    <div className="relative autocomplete-container">
                      <input
                        type="text"
                        value={emp.code}
                        onChange={(e) => autocomplete.handleAutocompleteInput(emp.id, 'code', e.target.value, handleInfoChange)}
                        onFocus={() => autocomplete.handleFieldFocus(emp.id, 'code', emp.code)}
                        onBlur={() => autocomplete.handleFieldBlur(emp.id, 'code')}
                        onCompositionStart={autocomplete.handleCompositionStart}
                        onCompositionEnd={autocomplete.handleCompositionEnd}
                        className="w-full h-full px-1 text-center focus:outline-none focus:bg-blue-50 bg-transparent font-semibold text-gray-700"
                      />
                      {isCodeActive && autocomplete.autocompleteState.suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded shadow-lg mt-1 max-h-40 overflow-y-auto autocomplete-container">
                          {autocomplete.autocompleteState.suggestions.map((suggestion) => (
                            <div
                              key={suggestion.id}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => autocomplete.selectSuggestion(emp.id, 'code', suggestion)}
                              className="px-2 py-1 hover:bg-blue-50 cursor-pointer text-sm"
                            >
                              <div className="font-semibold">{suggestion.code}</div>
                              <div className="text-xs text-gray-500">{suggestion.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Name - using defaultValue to prevent cursor jump */}
                  <td className="sticky z-10 border border-gray-300 bg-white p-0 relative" style={{ left: stickyPos.NAME }}>
                    <input
                      type="text"
                      key={`name-${emp.id}`}
                      defaultValue={emp.name || ''}
                      onBlur={(e) => {
                        if (e.target.value !== emp.name) {
                          handleInfoChange(emp.id, 'name', e.target.value);
                        }
                      }}
                      className="w-full h-full px-2 py-1 font-semibold text-gray-800 focus:outline-none focus:bg-blue-50 bg-transparent truncate"
                    />
                  </td>
                  {/* Department/Target */}
                  <td className="sticky z-10 border border-gray-300 p-0 bg-yellow-200" style={{ left: stickyPos.TARGET }}>
                    <input
                      type="text"
                      value={emp.department}
                      onChange={(e) => handleInfoChange(emp.id, 'department', e.target.value)}
                      className="w-full h-full bg-transparent px-1 font-medium focus:outline-none truncate"
                    />
                  </td>

                  {/* Day Cells */}
                  {days.map((day, cIdx) => {
                    const val = emp.attendance[day.date] || '';
                    const isSelected = cellSelection.isCellSelected(rIdx, cIdx);

                    return (
                      <td
                        key={`${emp.id}-${day.date}`}
                        onMouseDown={(e) => cellSelection.handleMouseDown(rIdx, cIdx, e)}
                        onMouseEnter={() => cellSelection.handleMouseEnter(rIdx, cIdx)}
                        onClick={() => cellSelection.handleCellClick(rIdx, cIdx)}
                        className={`border border-gray-300 p-0 text-center h-8 min-w-[32px] cursor-cell relative group/cell
                          ${getCellColor(val, day.isWeekend)}
                          ${isSelected ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}
                        `}
                      >
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleCellChange(emp.id, day.date, e.target.value)}
                          className={`w-full h-full text-center bg-transparent focus:outline-none font-bold ${val === 'CN' ? 'text-white' : ''
                            } ${isSelected ? 'bg-blue-500 bg-opacity-20 text-blue-900' : ''}`}
                          onMouseDown={(e) => cellSelection.handleMouseDown(rIdx, cIdx, e as any)}
                          onMouseEnter={() => cellSelection.handleMouseEnter(rIdx, cIdx)}
                          onDragStart={(e) => e.preventDefault()}
                          onKeyDown={(e) => {
                            if ((e.key === 'Delete' || e.key === 'Backspace') && val === '') {
                              e.preventDefault();
                            }
                          }}
                        />
                        {/* Clear button on hover */}
                        {val && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearCell(emp.id, day.date);
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover/cell:opacity-100 hover:bg-red-600 transition-opacity flex items-center justify-center z-20"
                            title="Xóa"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    );
                  })}

                  {/* Total */}
                  <td className="border border-gray-300 bg-[#00b050] text-white font-bold text-center p-1">
                    {calculateTotal(emp.attendance)}
                  </td>
                  {/* Delete button */}
                  <td className="border border-gray-300 text-center p-0">
                    <button
                      onClick={() => removeRow(emp.id)}
                      className="w-full h-full flex items-center justify-center text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr className="h-4"></tr>
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddEmployee}
        targets={targets}
        existingCodes={data.map(e => e.code)}
        allEmployeeCodes={allEmployees.map(e => e.code)}
      />
    </div>
  );
};
