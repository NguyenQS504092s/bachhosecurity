/**
 * Hook for managing cell selection in timesheet grid
 * Handles drag selection, keyboard shortcuts, copy/paste
 */

import { useState, useCallback, useEffect } from 'react';
import type { Employee, DayInfo } from '../types';

export interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface UseCellSelectionProps {
  data: Employee[];
  days: DayInfo[];
  onDataChange: (newData: Employee[]) => void;
}

export function useCellSelection({ data, days, onDataChange }: UseCellSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);

  // Mouse event handlers for drag selection
  const handleMouseDown = useCallback((rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsSelecting(true);
    setSelection({
      startRow: rowIndex,
      startCol: colIndex,
      endRow: rowIndex,
      endCol: colIndex,
    });
  }, []);

  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    setSelection({
      startRow: rowIndex,
      startCol: colIndex,
      endRow: rowIndex,
      endCol: colIndex,
    });
  }, []);

  const handleMouseEnter = useCallback((rowIndex: number, colIndex: number) => {
    if (isSelecting && selection) {
      setSelection(prev => prev ? {
        ...prev,
        endRow: rowIndex,
        endCol: colIndex,
      } : null);
    }
  }, [isSelecting, selection]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  // Global mouseup listener
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // Check if cell is selected
  const isCellSelected = useCallback((rowIndex: number, colIndex: number) => {
    if (!selection) return false;
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);
    return rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
  }, [selection]);

  // Copy selected cells to clipboard
  const copySelection = useCallback(() => {
    if (!selection) return;
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    let clipboardText = "";
    for (let r = minRow; r <= maxRow; r++) {
      const rowData = [];
      for (let c = minCol; c <= maxCol; c++) {
        const day = days[c].date;
        rowData.push(data[r].attendance[day] || "");
      }
      clipboardText += rowData.join("\t") + (r < maxRow ? "\n" : "");
    }
    navigator.clipboard.writeText(clipboardText);
  }, [selection, data, days]);

  // Paste from clipboard
  const pasteSelection = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      const rows = text.split(/\r\n|\n|\r/);
      if (rows.length > 0 && rows[rows.length - 1] === "") rows.pop();

      const startRow = selection ? Math.min(selection.startRow, selection.endRow) : 0;
      const startCol = selection ? Math.min(selection.startCol, selection.endCol) : 0;

      const isSingleValue = rows.length === 1 && rows[0].split("\t").length === 1;
      const isMultiSelection = selection && (selection.startRow !== selection.endRow || selection.startCol !== selection.endCol);

      let newData = [...data];

      if (isSingleValue && isMultiSelection) {
        const val = rows[0].trim();
        const minRow = Math.min(selection!.startRow, selection!.endRow);
        const maxRow = Math.max(selection!.startRow, selection!.endRow);
        const minCol = Math.min(selection!.startCol, selection!.endCol);
        const maxCol = Math.max(selection!.startCol, selection!.endCol);

        for (let r = minRow; r <= maxRow; r++) {
          if (r >= newData.length) break;
          const emp = { ...newData[r], attendance: { ...newData[r].attendance } };
          for (let c = minCol; c <= maxCol; c++) {
            const day = days[c].date;
            emp.attendance[day] = val;
          }
          newData[r] = emp;
        }
      } else {
        rows.forEach((rowStr, rIdx) => {
          const cells = rowStr.split("\t");
          const targetRowIdx = startRow + rIdx;

          if (targetRowIdx < newData.length) {
            const emp = { ...newData[targetRowIdx], attendance: { ...newData[targetRowIdx].attendance } };
            cells.forEach((val, cIdx) => {
              const targetColIdx = startCol + cIdx;
              if (targetColIdx < days.length) {
                const day = days[targetColIdx].date;
                emp.attendance[day] = val.trim();
              }
            });
            newData[targetRowIdx] = emp;
          }
        });
      }

      onDataChange(newData);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  }, [selection, data, days, onDataChange]);

  // Fill selection with first cell value
  const fillSelection = useCallback(() => {
    if (!selection) return;
    const minRow = Math.min(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const sourceVal = data[minRow].attendance[days[minCol].date] || "";
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    const newData = data.map((emp, rIdx) => {
      if (rIdx >= minRow && rIdx <= maxRow) {
        const newAttendance = { ...emp.attendance };
        for (let c = minCol; c <= maxCol; c++) {
          const day = days[c].date;
          newAttendance[day] = sourceVal;
        }
        return { ...emp, attendance: newAttendance };
      }
      return emp;
    });

    onDataChange(newData);
  }, [selection, data, days, onDataChange]);

  // Clear selected cells
  const clearSelection = useCallback(() => {
    if (!selection) return;
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    const newData = data.map((emp, rIdx) => {
      if (rIdx >= minRow && rIdx <= maxRow) {
        const newAtt = { ...emp.attendance };
        for (let c = minCol; c <= maxCol; c++) {
          const day = days[c].date;
          newAtt[day] = "";
        }
        return { ...emp, attendance: newAtt };
      }
      return emp;
    });
    onDataChange(newData);
  }, [selection, data, days, onDataChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selection) {
          e.preventDefault();
          copySelection();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (selection) {
          pasteSelection();
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection) {
          clearSelection();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selection, copySelection, pasteSelection, clearSelection]);

  return {
    selection,
    isSelecting,
    handleMouseDown,
    handleMouseEnter,
    handleCellClick,
    isCellSelected,
    copySelection,
    pasteSelection,
    fillSelection,
    clearSelection,
  };
}
