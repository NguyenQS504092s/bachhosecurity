/**
 * Shift Manager Component
 * Manages custom shift times
 */

import React, { useState } from 'react';
import { Clock, Plus, Save, X, Edit2 } from 'lucide-react';
import { useShiftOptions } from '../hooks/use-shift-options';

interface ShiftManagerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ShiftManager: React.FC<ShiftManagerProps> = ({ isOpen, onToggle }) => {
  const { shiftOptions, customShifts, isLoading, addCustomShift, removeCustomShift, updateCustomShift } = useShiftOptions();

  const [newShiftStart, setNewShiftStart] = useState('08:00');
  const [newShiftEnd, setNewShiftEnd] = useState('17:00');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const handleAddShift = async () => {
    await addCustomShift(newShiftStart, newShiftEnd);
    setNewShiftStart('08:00');
    setNewShiftEnd('17:00');
  };

  const startEdit = (shift: string, index: number) => {
    const [start, end] = shift.split(' - ');
    setEditStart(start);
    setEditEnd(end);
    setEditingIndex(index);
  };

  const saveEdit = async (originalShift: string) => {
    try {
      await updateCustomShift(originalShift, `${editStart} - ${editEnd}`);
      setEditingIndex(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="w-full mt-2 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
        title="Quản lý khung giờ ca trực"
      >
        <Clock size={12} /> Quản Lý Ca Trực
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-white border rounded-lg shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Clock size={14} className="mr-1" /> Khung Giờ Ca Trực
          </h4>

          {/* Add new shift */}
          <div className="flex gap-1 mb-2">
            <input
              type="time"
              value={newShiftStart}
              onChange={(e) => setNewShiftStart(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border rounded"
            />
            <span className="text-gray-400 self-center">-</span>
            <input
              type="time"
              value={newShiftEnd}
              onChange={(e) => setNewShiftEnd(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border rounded"
            />
            <button
              onClick={handleAddShift}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              title="Thêm ca mới"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* List of shifts */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="text-xs text-gray-400 text-center py-2">Đang tải...</div>
            ) : (
              shiftOptions.map((shift, idx) => {
                const isCustom = customShifts.includes(shift);
                const isEditing = editingIndex === idx;

                return (
                  <div key={idx} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded">
                    {isEditing ? (
                      <>
                        <input
                          type="time"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          className="flex-1 px-1 py-0.5 border rounded text-xs"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="time"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                          className="flex-1 px-1 py-0.5 border rounded text-xs"
                        />
                        <button onClick={() => saveEdit(shift)} className="text-green-500 hover:text-green-700 p-0.5" title="Lưu">
                          <Save size={12} />
                        </button>
                        <button onClick={() => setEditingIndex(null)} className="text-gray-400 hover:text-gray-600 p-0.5" title="Hủy">
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`flex-1 ${isCustom ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                          {shift} {isCustom && '(tùy chỉnh)'}
                        </span>
                        <button onClick={() => startEdit(shift, idx)} className="text-blue-400 hover:text-blue-600 p-0.5" title="Sửa">
                          <Edit2 size={12} />
                        </button>
                        {isCustom && (
                          <button onClick={() => removeCustomShift(shift)} className="text-red-400 hover:text-red-600 p-0.5" title="Xóa">
                            <X size={12} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
};
