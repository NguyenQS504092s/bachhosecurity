/**
 * HR Management Component (Modular Version)
 * Main component for human resources management
 */

import React, { useState, useMemo } from 'react';
import { Shield, ShieldAlert } from 'lucide-react';
import type { Employee } from '../../types';
import { HRToolbar } from './hr-toolbar';
import { AddEmployeeRow } from './add-employee-row';
import { EmployeeTableRow } from './employee-table-row';
import { EmployeeDetailModal } from './employee-detail-modal';

interface HRManagementProps {
  employees: Employee[];
  gridData: Employee[];
  year: number;
  month: number;
  currentUser: Employee | null;
  onUpdateEmployee: (updatedEmp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onAddEmployee: (newEmp: Employee) => void;
}

const defaultNewEmployee: Partial<Employee> = {
  code: '',
  name: '',
  department: 'Văn Phòng',
  password: '123',
  role: 'staff',
  dailyRate: 200000,
  bonus: 0,
  penalty: 0
};

export const HRManagement: React.FC<HRManagementProps> = ({
  employees,
  gridData,
  year,
  month,
  currentUser,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddEmployee
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState<Partial<Employee>>(defaultNewEmployee);
  const [importError, setImportError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Filter employees based on permissions
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let filtered = employees.filter(emp =>
      (emp.name || '').toLowerCase().includes(term) ||
      (emp.code || '').toLowerCase().includes(term)
    );

    // If user is staff, only show themselves
    if (currentUser?.role === 'staff') {
      filtered = filtered.filter(emp => emp.id === currentUser.id);
    }

    return filtered;
  }, [employees, searchTerm, currentUser]);

  // Edit handlers
  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({ ...emp });
    setViewingEmployee(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      const original = employees.find(e => e.id === editingId);
      if (original) {
        onUpdateEmployee({ ...original, ...editForm } as Employee);
      }
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleDelete = (emp: Employee) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên "${emp.name}" (${emp.code})?\n\nLưu ý: Hành động này không thể hoàn tác.`)) {
      onDeleteEmployee(emp.id);
      if (editingId === emp.id) cancelEdit();
      if (viewingEmployee?.id === emp.id) setViewingEmployee(null);
    }
  };

  const handleView = (emp: Employee) => {
    setViewingEmployee(emp);
    setEditingId(null);
  };

  // Add handlers
  const handleAddNew = () => {
    setIsAdding(true);
    setNewEmployeeForm(defaultNewEmployee);
    setEditingId(null);
    setViewingEmployee(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewEmployeeForm(defaultNewEmployee);
  };

  const saveNewEmployee = () => {
    if (!newEmployeeForm.code || !newEmployeeForm.name) {
      alert('Vui lòng nhập đầy đủ Mã NV và Họ Tên');
      return;
    }

    if (employees.some(e => e.code === newEmployeeForm.code)) {
      alert(`Mã nhân viên "${newEmployeeForm.code}" đã tồn tại. Vui lòng sử dụng mã khác.`);
      return;
    }

    const newEmployee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      code: newEmployeeForm.code || '',
      name: newEmployeeForm.name || '',
      department: newEmployeeForm.department || 'Văn Phòng',
      shift: '08:00 - 17:00',
      attendance: {},
      password: newEmployeeForm.password || '123',
      role: (newEmployeeForm.role || 'staff') as 'admin' | 'staff',
      dailyRate: newEmployeeForm.dailyRate || 200000,
      bonus: newEmployeeForm.bonus || 0,
      penalty: newEmployeeForm.penalty || 0
    };

    onAddEmployee(newEmployee);
    cancelAdd();
  };

  // Import handlers
  const handleImportSuccess = (importedEmployees: Employee[]) => {
    importedEmployees.forEach(emp => onAddEmployee(emp));
    alert(`Đã nhập thành công ${importedEmployees.length} nhân viên!`);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Shield className="mr-2 text-amber-600" /> Quản Lý Nhân Sự & Tài Khoản
            </h2>
            <p className="text-sm text-gray-500 mt-1">Quản lý thông tin đăng nhập và phân quyền nhân viên</p>
          </div>

          <HRToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isAdmin={isAdmin}
            employees={employees}
            onAddNew={handleAddNew}
            onImportSuccess={handleImportSuccess}
            onImportError={setImportError}
          />
        </div>

        {/* Import Error */}
        {importError && (
          <div className="mx-6 mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            <strong>Lỗi nhập file:</strong>
            <pre className="mt-1 text-xs whitespace-pre-wrap">{importError}</pre>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã NV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng Ban</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền Hạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mật Khẩu</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn Giá</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thưởng</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Phạt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isAdding && (
                <AddEmployeeRow
                  form={newEmployeeForm}
                  onFormChange={setNewEmployeeForm}
                  onSave={saveNewEmployee}
                  onCancel={cancelAdd}
                />
              )}
              {filteredEmployees.map((emp) => (
                <EmployeeTableRow
                  key={emp.id}
                  emp={emp}
                  isEditing={editingId === emp.id}
                  editForm={editForm}
                  isAdmin={isAdmin}
                  onEditFormChange={setEditForm}
                  onStartEdit={() => startEdit(emp)}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                  onView={() => handleView(emp)}
                  onDelete={() => handleDelete(emp)}
                />
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Không tìm thấy nhân viên nào.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-amber-50 p-4 text-xs text-amber-800 border-t border-amber-100 flex items-start">
          <ShieldAlert size={16} className="mr-2 mt-0.5" />
          <div>
            <strong>Lưu ý bảo mật:</strong> Chỉ những tài khoản có quyền Quản Trị (Admin) mới có thể truy cập vào trang này.
            Mật khẩu nhân viên nên được đặt phức tạp để đảm bảo an toàn.
          </div>
        </div>
      </div>

      {/* View Employee Modal */}
      {viewingEmployee && (
        <EmployeeDetailModal
          employee={viewingEmployee}
          gridData={gridData}
          year={year}
          month={month}
          isAdmin={isAdmin}
          onClose={() => setViewingEmployee(null)}
          onEdit={() => {
            setViewingEmployee(null);
            startEdit(viewingEmployee);
          }}
        />
      )}
    </>
  );
};
