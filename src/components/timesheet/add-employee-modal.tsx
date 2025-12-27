/**
 * Add Employee Modal Component
 * Modal form for adding new employee with validation
 */

import React, { useState } from 'react';
import { Plus, X, Save, AlertCircle } from 'lucide-react';
import type { Employee, Target } from '../../types';

export interface AddEmployeeFormData {
  code: string;
  name: string;
  department: string;
}

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: Employee) => void;
  targets: Target[];
  existingCodes: string[]; // Codes already in grid
  allEmployeeCodes: string[]; // Codes in master list
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targets,
  existingCodes,
  allEmployeeCodes,
}) => {
  const [form, setForm] = useState<AddEmployeeFormData>({
    code: '',
    name: '',
    department: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setForm({ code: '', name: '', department: '' });
      setErrors([]);
    }
  }, [isOpen]);

  // Validate and submit form
  const handleSubmit = () => {
    const validationErrors: string[] = [];
    const trimmedCode = form.code.trim();
    const trimmedName = form.name.trim();
    const trimmedDept = form.department.trim();

    // Required field validation
    if (!trimmedCode) {
      validationErrors.push('Mã NV không được để trống');
    }
    if (!trimmedName) {
      validationErrors.push('Họ tên không được để trống');
    }

    // Code format validation (alphanumeric, no spaces)
    if (trimmedCode && !/^[a-zA-Z0-9]+$/.test(trimmedCode)) {
      validationErrors.push('Mã NV chỉ được chứa chữ và số (không có dấu cách)');
    }

    // Duplicate code check in grid
    if (trimmedCode && existingCodes.some(c => c.toLowerCase() === trimmedCode.toLowerCase())) {
      validationErrors.push(`Mã NV "${trimmedCode}" đã tồn tại trong bảng chấm công`);
    }

    // Duplicate code check in allEmployees (master list)
    if (trimmedCode && allEmployeeCodes.some(c => c.toLowerCase() === trimmedCode.toLowerCase())) {
      validationErrors.push(`Mã NV "${trimmedCode}" đã tồn tại trong hệ thống`);
    }

    // Name length validation
    if (trimmedName && trimmedName.length < 2) {
      validationErrors.push('Họ tên phải có ít nhất 2 ký tự');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Create new employee
    const newEmployee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      code: trimmedCode.toUpperCase(),
      name: trimmedName,
      department: trimmedDept || 'Chưa xác định',
      shift: '08:00 - 17:00',
      attendance: {},
      password: '123',
      role: 'staff'
    };

    onSubmit(newEmployee);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Plus size={20} className="mr-2 text-blue-600" />
            Thêm Nhân Viên Mới
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form body */}
        <div className="p-4 space-y-4">
          {/* Error messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  {errors.map((err, idx) => (
                    <div key={idx}>• {err}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Code field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã NV <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="VD: NV001"
              autoFocus
            />
          </div>

          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="VD: Nguyễn Văn A"
            />
          </div>

          {/* Department/Target field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mục Tiêu / Phòng Ban
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">-- Chọn mục tiêu --</option>
              {targets.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
              <option value="Văn Phòng">Văn Phòng</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Info text */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <strong>Lưu ý:</strong> Nhân viên mới sẽ được tự động đồng bộ với trang Nhân Sự và lưu vào hệ thống.
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <Save size={16} className="mr-2" />
            Thêm Nhân Viên
          </button>
        </div>
      </div>
    </div>
  );
};
