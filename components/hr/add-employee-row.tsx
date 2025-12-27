/**
 * Add Employee Row Component
 * Table row for adding new employee
 */

import React from 'react';
import { Key, Save, X } from 'lucide-react';
import type { Employee } from '../../types';

interface AddEmployeeRowProps {
  form: Partial<Employee>;
  onFormChange: (form: Partial<Employee>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const AddEmployeeRow: React.FC<AddEmployeeRowProps> = ({
  form,
  onFormChange,
  onSave,
  onCancel
}) => {
  return (
    <tr className="bg-green-50 border-2 border-green-300">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="text"
          placeholder="Mã NV"
          className="border rounded px-2 py-1 w-full text-sm font-medium"
          value={form.code || ''}
          onChange={(e) => onFormChange({ ...form, code: e.target.value })}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="text"
          placeholder="Họ Tên"
          className="border rounded px-2 py-1 w-full text-sm"
          value={form.name || ''}
          onChange={(e) => onFormChange({ ...form, name: e.target.value })}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="text"
          placeholder="Phòng Ban"
          className="border rounded px-2 py-1 w-full text-sm"
          value={form.department || ''}
          onChange={(e) => onFormChange({ ...form, department: e.target.value })}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={form.role || 'staff'}
          onChange={(e) => onFormChange({ ...form, role: e.target.value as 'admin' | 'staff' })}
        >
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Key size={14} className="mr-1 text-gray-400" />
          <input
            type="text"
            placeholder="Mật khẩu"
            className="border rounded px-2 py-1 w-24 text-sm font-mono"
            value={form.password || ''}
            onChange={(e) => onFormChange({ ...form, password: e.target.value })}
          />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <input
          type="number"
          placeholder="200000"
          className="border rounded px-2 py-1 w-24 text-sm text-right"
          value={form.dailyRate || ''}
          onChange={(e) => onFormChange({ ...form, dailyRate: parseInt(e.target.value) || 0 })}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <input
          type="number"
          placeholder="0"
          className="border rounded px-2 py-1 w-20 text-sm text-right"
          value={form.bonus || ''}
          onChange={(e) => onFormChange({ ...form, bonus: parseInt(e.target.value) || 0 })}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <input
          type="number"
          placeholder="0"
          className="border rounded px-2 py-1 w-20 text-sm text-right"
          value={form.penalty || ''}
          onChange={(e) => onFormChange({ ...form, penalty: parseInt(e.target.value) || 0 })}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-2">
          <button onClick={onSave} className="text-green-600 hover:text-green-900" title="Lưu">
            <Save size={18} />
          </button>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700" title="Hủy">
            <X size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};
