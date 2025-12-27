/**
 * Target Form Component
 * Add/Edit target with roster
 */

import React, { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { Target, Employee, RosterItem } from '../../../types';
import { RosterEditor } from './roster-editor';

interface TargetFormProps {
  target: Target | null;
  isCreating: boolean;
  employees: Employee[];
  onSave: (data: { name: string; roster: RosterItem[] }) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export const TargetForm: React.FC<TargetFormProps> = ({
  target,
  isCreating,
  employees,
  onSave,
  onDelete,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [roster, setRoster] = useState<RosterItem[]>([]);

  useEffect(() => {
    if (target) {
      setName(target.name);
      setRoster([...target.roster]);
    } else if (isCreating) {
      setName('Mục Tiêu Mới');
      setRoster([]);
    }
  }, [target, isCreating]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name, roster });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b bg-white" style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(0, 112, 192, 1)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isCreating ? 'Thêm Mục Tiêu Mới' : 'Chỉnh Sửa Mục Tiêu'}
          </h2>
          <button
            onClick={onDelete}
            disabled={isCreating}
            className="text-red-500 hover:bg-red-50 p-2 rounded disabled:opacity-0"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên Mục Tiêu / Địa Điểm</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ví dụ: Mục tiêu Kho A"
          />
        </div>
      </div>

      <RosterEditor roster={roster} employees={employees} onChange={setRoster} />

      <div className="p-4 border-t bg-white flex justify-end space-x-2">
        <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
          Hủy
        </button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
          <Save size={16} className="mr-2" /> Lưu Thay Đổi
        </button>
      </div>
    </div>
  );
};
