/**
 * Employee Table Row Component
 * Single row in employee table with view/edit/delete actions
 */

import React from 'react';
import { Key, Save, X, Eye, Edit, Trash2 } from 'lucide-react';
import type { Employee } from '../../types';

interface EmployeeTableRowProps {
  emp: Employee;
  isEditing: boolean;
  editForm: Partial<Employee>;
  isAdmin: boolean;
  onEditFormChange: (form: Partial<Employee>) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}

export const EmployeeTableRow: React.FC<EmployeeTableRowProps> = ({
  emp,
  isEditing,
  editForm,
  isAdmin,
  onEditFormChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onView,
  onDelete
}) => {
  return (
    <tr className="hover:bg-amber-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {isEditing ? (
          <input
            className="border rounded px-2 py-1 w-24 font-medium"
            value={editForm.code || ''}
            onChange={e => onEditFormChange({ ...editForm, code: e.target.value })}
            placeholder="Mã NV"
          />
        ) : emp.code}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {isEditing ? (
          <input
            className="border rounded px-2 py-1 w-full"
            value={editForm.name || ''}
            onChange={e => onEditFormChange({ ...editForm, name: e.target.value })}
          />
        ) : (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mr-3 font-bold">
              {(emp.name || '?').charAt(0)}
            </div>
            {emp.name || 'N/A'}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isEditing ? (
          <input
            className="border rounded px-2 py-1 w-full"
            value={editForm.department || ''}
            onChange={e => onEditFormChange({ ...editForm, department: e.target.value })}
          />
        ) : emp.department}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {isEditing ? (
          <select
            className="border rounded px-2 py-1"
            value={editForm.role || 'staff'}
            onChange={e => onEditFormChange({ ...editForm, role: e.target.value as 'admin' | 'staff' })}
          >
            <option value="staff">Nhân viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        ) : (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {emp.role === 'admin' ? 'Quản Trị' : 'Nhân Viên'}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
        {isEditing ? (
          <div className="flex items-center">
            <Key size={14} className="mr-1 text-gray-400" />
            <input
              className="border rounded px-2 py-1 w-24"
              type="text"
              value={editForm.password || ''}
              onChange={e => onEditFormChange({ ...editForm, password: e.target.value })}
            />
          </div>
        ) : '••••••'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
        {isEditing ? (
          <input
            className="border rounded px-2 py-1 w-24 text-right"
            type="number"
            value={editForm.dailyRate || ''}
            onChange={e => onEditFormChange({ ...editForm, dailyRate: parseInt(e.target.value) || 0 })}
            placeholder="200000"
          />
        ) : (emp.dailyRate ? emp.dailyRate.toLocaleString('vi-VN') : '200,000')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
        {isEditing ? (
          <input
            className="border rounded px-2 py-1 w-20 text-right"
            type="number"
            value={editForm.bonus || ''}
            onChange={e => onEditFormChange({ ...editForm, bonus: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        ) : (emp.bonus ? `+${emp.bonus.toLocaleString('vi-VN')}` : '-')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
        {isEditing ? (
          <input
            className="border rounded px-2 py-1 w-20 text-right"
            type="number"
            value={editForm.penalty || ''}
            onChange={e => onEditFormChange({ ...editForm, penalty: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        ) : (emp.penalty ? `-${emp.penalty.toLocaleString('vi-VN')}` : '-')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {isEditing ? (
          <div className="flex justify-end space-x-2">
            <button onClick={onSaveEdit} className="text-green-600 hover:text-green-900" title="Lưu">
              <Save size={18} />
            </button>
            <button onClick={onCancelEdit} className="text-gray-500 hover:text-gray-700" title="Hủy">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            <button
              onClick={onView}
              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
              title="Xem chi tiết"
            >
              <Eye size={18} />
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={onStartEdit}
                  className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-amber-50"
                  title="Sửa"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  title="Xóa"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};
