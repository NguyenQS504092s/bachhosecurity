/**
 * Roster Editor Component
 * Edit employees and shifts in a target
 */

import React from 'react';
import { Plus, X } from 'lucide-react';
import { Employee, RosterItem } from '../../../types';
import { useShiftOptions } from '../hooks/use-shift-options';

interface RosterEditorProps {
  roster: RosterItem[];
  employees: Employee[];
  onChange: (roster: RosterItem[]) => void;
}

export const RosterEditor: React.FC<RosterEditorProps> = ({
  roster,
  employees,
  onChange
}) => {
  const { shiftOptions } = useShiftOptions();

  const addItem = () => {
    onChange([...roster, { employeeId: '', shift: '' }]);
  };

  const removeItem = (index: number) => {
    onChange(roster.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof RosterItem, value: string) => {
    const updated = [...roster];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="flex justify-between items-end mb-2">
        <label className="block text-sm font-bold text-gray-700">Danh Sách Nhân Sự & Ca Trực</label>
        <button
          onClick={addItem}
          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center"
        >
          <Plus size={12} className="mr-1" /> Thêm Nhân Sự
        </button>
      </div>

      <div className="space-y-2">
        {roster.map((item, index) => (
          <div key={index} className="flex gap-2 items-center bg-white p-2 rounded border shadow-sm">
            <div className="flex-1">
              <select
                value={item.employeeId}
                onChange={(e) => updateItem(index, 'employeeId', e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">-- Chọn Nhân Sự --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.code})</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <input
                type="text"
                list={`shift-options-${index}`}
                value={item.shift}
                onChange={(e) => updateItem(index, 'shift', e.target.value)}
                placeholder="VD: 08h00 - 17h00"
                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <datalist id={`shift-options-${index}`}>
                {shiftOptions.map((shift) => (
                  <option key={shift} value={shift} />
                ))}
              </datalist>
            </div>
            <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500">
              <X size={18} />
            </button>
          </div>
        ))}
        {roster.length === 0 && (
          <div className="text-sm text-gray-400 italic text-center py-4 border-2 border-dashed rounded">
            Chưa có nhân sự nào trong mục tiêu này.
          </div>
        )}
      </div>
    </div>
  );
};
