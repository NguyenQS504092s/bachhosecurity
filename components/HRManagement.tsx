import React, { useState, useMemo, useRef } from 'react';
import { Employee } from '../types';
import { User, Key, Save, Search, Shield, ShieldAlert, Eye, Edit, Trash2, X, Calendar, TrendingUp, Plus, Download, Upload, DollarSign } from 'lucide-react';
import { DAYS_OF_WEEK_EN } from '../constants';
import { exportEmployeesToExcel, importEmployeesFromExcel } from '../utils/excel-export';

interface HRManagementProps {
  employees: Employee[];
  gridData: Employee[]; // Timesheet data to calculate totals
  year: number;
  month: number; // 0-indexed
  currentUser: Employee | null; // Current logged in user for permission check
  onUpdateEmployee: (updatedEmp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onAddEmployee: (newEmp: Employee) => void;
}

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
  const [viewMonth, setViewMonth] = useState(month);
  const [viewYear, setViewYear] = useState(year);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState<Partial<Employee>>({
    code: '',
    name: '',
    department: 'Văn Phòng',
    password: '123',
    role: 'staff',
    dailyRate: 200000,
    bonus: 0,
    penalty: 0
  });
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter employees based on permissions
  const filteredEmployees = useMemo(() => {
    let filtered = employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // If user is staff, only show themselves
    if (currentUser?.role === 'staff') {
      filtered = filtered.filter(emp => emp.id === currentUser.id);
    }
    
    return filtered;
  }, [employees, searchTerm, currentUser]);

  // Calculate attendance statistics for an employee
  const calculateEmployeeStats = (emp: Employee, targetMonth: number = month, targetYear: number = year) => {
    // Find employee in gridData by code
    const gridEmployee = gridData.find(e => e.code === emp.code);
    if (!gridEmployee || !gridEmployee.attendance) {
      return {
        totalDays: 0,
        totalWork: 0,
        halfDays: 0,
        leaveDays: 0,
        weekendDays: 0,
        emptyDays: 0
      };
    }

    const attendance = gridEmployee.attendance;
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    
    let totalWork = 0;
    let halfDays = 0;
    let leaveDays = 0;
    let weekendDays = 0;
    let emptyDays = 0;
    let totalDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const value = attendance[day] || '';

      if (value === 'CN' || value === 'Red') {
        weekendDays++;
      } else if (value === 'P') {
        leaveDays++;
      } else if (value === '0.5') {
        halfDays++;
        totalWork += 0.5;
      } else if (value === '1') {
        totalWork += 1;
        totalDays++;
      } else if (value === '') {
        if (isWeekend) {
          weekendDays++;
        } else {
          emptyDays++;
        }
      } else {
        // Try to parse as number
        const num = parseFloat(value);
        if (!isNaN(num)) {
          totalWork += num;
          if (num === 1) totalDays++;
          else if (num === 0.5) halfDays++;
        }
      }
    }

    return {
      totalDays,
      totalWork: Math.round(totalWork * 100) / 100,
      halfDays,
      leaveDays,
      weekendDays,
      emptyDays
    };
  };

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
      // Find original to merge properly
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
      if (editingId === emp.id) {
        cancelEdit();
      }
      if (viewingEmployee?.id === emp.id) {
        setViewingEmployee(null);
      }
    }
  };

  const handleView = (emp: Employee) => {
    setViewingEmployee(emp);
    setEditingId(null);
    setViewMonth(month);
    setViewYear(year);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setNewEmployeeForm({
      code: '',
      name: '',
      department: 'Văn Phòng',
      password: '123',
      role: 'staff',
      dailyRate: 200000,
      bonus: 0,
      penalty: 0
    });
    setEditingId(null);
    setViewingEmployee(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewEmployeeForm({
      code: '',
      name: '',
      department: 'Văn Phòng',
      password: '123',
      role: 'staff',
      dailyRate: 200000,
      bonus: 0,
      penalty: 0
    });
  };

  const saveNewEmployee = () => {
    if (!newEmployeeForm.code || !newEmployeeForm.name) {
      alert('Vui lòng nhập đầy đủ Mã NV và Họ Tên');
      return;
    }

    // Check if code already exists
    if (employees.some(e => e.code === newEmployeeForm.code)) {
      alert(`Mã nhân viên "${newEmployeeForm.code}" đã tồn tại. Vui lòng sử dụng mã khác.`);
      return;
    }

    const newEmployee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      code: newEmployeeForm.code || '',
      name: newEmployeeForm.name || '',
      department: newEmployeeForm.department || 'Văn Phòng',
      shift: '08h00 - 17h00',
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

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                     'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  // Import/Export handlers
  const handleExportExcel = () => {
    exportEmployeesToExcel(employees);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      const { employees: importedEmployees, errors } = await importEmployeesFromExcel(file, employees);

      if (errors.length > 0) {
        setImportError(errors.join('\n'));
      }

      if (importedEmployees.length > 0) {
        importedEmployees.forEach(emp => {
          onAddEmployee(emp);
        });
        alert(`Đã nhập thành công ${importedEmployees.length} nhân viên!`);
      }
    } catch (err: any) {
      setImportError(err.message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <div>
             <h2 className="text-xl font-bold text-gray-800 flex items-center">
               <Shield className="mr-2 text-amber-600" /> Quản Lý Nhân Sự & Tài Khoản
             </h2>
             <p className="text-sm text-gray-500 mt-1">Quản lý thông tin đăng nhập và phân quyền nhân viên</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                className="pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-amber-500 focus:outline-none w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            {currentUser?.role === 'admin' && (
              <>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
                  title="Xuất danh sách nhân sự"
                >
                  <Download size={18} />
                  <span>Xuất Excel</span>
                </button>
                <button
                  onClick={handleImportClick}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow transition"
                  title="Nhập nhân sự từ Excel"
                >
                  <Upload size={18} />
                  <span>Nhập Excel</span>
                </button>
                <button
                  onClick={handleAddNew}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
                >
                  <Plus size={18} />
                  <span>Thêm Nhân Sự</span>
                </button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
        </div>

        {importError && (
          <div className="mx-6 mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            <strong>Lỗi nhập file:</strong>
            <pre className="mt-1 text-xs whitespace-pre-wrap">{importError}</pre>
          </div>
        )}

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
                <tr className="bg-green-50 border-2 border-green-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      placeholder="Mã NV"
                      className="border rounded px-2 py-1 w-full text-sm font-medium"
                      value={newEmployeeForm.code || ''}
                      onChange={(e) => setNewEmployeeForm({...newEmployeeForm, code: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      placeholder="Họ Tên"
                      className="border rounded px-2 py-1 w-full text-sm"
                      value={newEmployeeForm.name || ''}
                      onChange={(e) => setNewEmployeeForm({...newEmployeeForm, name: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      placeholder="Phòng Ban"
                      className="border rounded px-2 py-1 w-full text-sm"
                      value={newEmployeeForm.department || ''}
                      onChange={(e) => setNewEmployeeForm({...newEmployeeForm, department: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={newEmployeeForm.role || 'staff'}
                      onChange={(e) => setNewEmployeeForm({...newEmployeeForm, role: e.target.value as any})}
                    >
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Key size={14} className="mr-1 text-gray-400"/>
                      <input
                        type="text"
                        placeholder="Mật khẩu"
                        className="border rounded px-2 py-1 w-24 text-sm font-mono"
                        value={newEmployeeForm.password || ''}
                        onChange={(e) => setNewEmployeeForm({...newEmployeeForm, password: e.target.value})}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <input
                      type="number"
                      placeholder="200000"
                      className="border rounded px-2 py-1 w-24 text-sm text-right"
                      value={newEmployeeForm.dailyRate || ''}
                      onChange={(e) => setNewEmployeeForm({...newEmployeeForm, dailyRate: parseInt(e.target.value) || 0})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <input
                      type="number"
                      placeholder="0"
                      className="border rounded px-2 py-1 w-20 text-sm text-right"
                      value={newEmployeeForm.bonus || ''}
                      onChange={(e) => setNewEmployeeForm({...newEmployeeForm, bonus: parseInt(e.target.value) || 0})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <input
                      type="number"
                      placeholder="0"
                      className="border rounded px-2 py-1 w-20 text-sm text-right"
                      value={newEmployeeForm.penalty || ''}
                      onChange={(e) => setNewEmployeeForm({...newEmployeeForm, penalty: parseInt(e.target.value) || 0})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={saveNewEmployee}
                        className="text-green-600 hover:text-green-900"
                        title="Lưu"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={cancelAdd}
                        className="text-gray-500 hover:text-gray-700"
                        title="Hủy"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-amber-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                     {emp.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                     {editingId === emp.id ? (
                         <input 
                           className="border rounded px-2 py-1 w-full"
                           value={editForm.name || ''}
                           onChange={e => setEditForm({...editForm, name: e.target.value})}
                         />
                     ) : (
                         <div className="flex items-center">
                           <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mr-3 font-bold">
                              {emp.name.charAt(0)}
                           </div>
                           {emp.name}
                         </div>
                     )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === emp.id ? (
                         <input 
                           className="border rounded px-2 py-1 w-full"
                           value={editForm.department || ''}
                           onChange={e => setEditForm({...editForm, department: e.target.value})}
                         />
                     ) : emp.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingId === emp.id ? (
                          <select 
                              className="border rounded px-2 py-1"
                              value={editForm.role || 'staff'}
                              onChange={e => setEditForm({...editForm, role: e.target.value as any})}
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
                      {editingId === emp.id ? (
                         <div className="flex items-center">
                             <Key size={14} className="mr-1 text-gray-400"/>
                             <input
                               className="border rounded px-2 py-1 w-24"
                               type="text"
                               value={editForm.password || ''}
                               onChange={e => setEditForm({...editForm, password: e.target.value})}
                             />
                         </div>
                     ) : '••••••'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {editingId === emp.id ? (
                         <input
                           className="border rounded px-2 py-1 w-24 text-right"
                           type="number"
                           value={editForm.dailyRate || ''}
                           onChange={e => setEditForm({...editForm, dailyRate: parseInt(e.target.value) || 0})}
                           placeholder="200000"
                         />
                     ) : (emp.dailyRate ? emp.dailyRate.toLocaleString('vi-VN') : '200,000')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                      {editingId === emp.id ? (
                         <input
                           className="border rounded px-2 py-1 w-20 text-right"
                           type="number"
                           value={editForm.bonus || ''}
                           onChange={e => setEditForm({...editForm, bonus: parseInt(e.target.value) || 0})}
                           placeholder="0"
                         />
                     ) : (emp.bonus ? `+${emp.bonus.toLocaleString('vi-VN')}` : '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                      {editingId === emp.id ? (
                         <input
                           className="border rounded px-2 py-1 w-20 text-right"
                           type="number"
                           value={editForm.penalty || ''}
                           onChange={e => setEditForm({...editForm, penalty: parseInt(e.target.value) || 0})}
                           placeholder="0"
                         />
                     ) : (emp.penalty ? `-${emp.penalty.toLocaleString('vi-VN')}` : '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     {editingId === emp.id ? (
                         <div className="flex justify-end space-x-2">
                             <button onClick={saveEdit} className="text-green-600 hover:text-green-900" title="Lưu">
                               <Save size={18} />
                             </button>
                             <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700" title="Hủy">
                               <X size={18} />
                             </button>
                         </div>
                     ) : (
                         <div className="flex justify-end space-x-2">
                             <button 
                               onClick={() => handleView(emp)} 
                               className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" 
                               title="Xem chi tiết"
                             >
                               <Eye size={18} />
                             </button>
                             {currentUser?.role === 'admin' && (
                               <>
                                 <button 
                                   onClick={() => startEdit(emp)} 
                                   className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-amber-50" 
                                   title="Sửa"
                                 >
                                   <Edit size={18} />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(emp)} 
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
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                  Không tìm thấy nhân viên nào.
              </div>
          )}
        </div>
        
        <div className="bg-amber-50 p-4 text-xs text-amber-800 border-t border-amber-100 flex items-start">
           <ShieldAlert size={16} className="mr-2 mt-0.5" />
           <div>
               <strong>Lưu ý bảo mật:</strong> Chỉ những tài khoản có quyền Quản Trị (Admin) mới có thể truy cập vào trang này. 
               Mật khẩu nhân viên nên được đặt phức tạp để đảm bảo an toàn.
           </div>
        </div>
      </div>

      {/* View Employee Details Modal */}
      {viewingEmployee && (() => {
        const stats = calculateEmployeeStats(viewingEmployee, viewMonth, viewYear);
        const emp = viewingEmployee;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <User size={24} className="mr-2 text-blue-600" />
                  Thông Tin Chi Tiết Nhân Viên
                </h2>
                <button
                  onClick={() => setViewingEmployee(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Employee Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Mã Nhân Viên</label>
                    <div className="text-lg font-bold text-gray-800">{emp.code}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Họ Tên</label>
                    <div className="text-lg font-semibold text-gray-800">{emp.name}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Phòng Ban</label>
                    <div className="text-sm text-gray-700">{emp.department}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Quyền Hạn</label>
                    <div>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {emp.role === 'admin' ? 'Quản Trị' : 'Nhân Viên'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Statistics */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <Calendar size={20} className="mr-2 text-purple-600" />
                    Thống Kê Chấm Công
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={viewMonth}
                      onChange={(e) => setViewMonth(parseInt(e.target.value))}
                      className="border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {Array.from({length: 12}).map((_, i) => (
                        <option key={i} value={i}>{monthNames[i]}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={viewYear}
                      onChange={(e) => setViewYear(parseInt(e.target.value) || viewYear)}
                      className="border rounded px-3 py-1.5 w-24 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      min="2020"
                      max="2100"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-xs text-green-600 uppercase font-semibold mb-1">Tổng Công</div>
                    <div className="text-2xl font-bold text-green-700">{stats.totalWork}</div>
                    <div className="text-xs text-green-600 mt-1">công</div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-xs text-blue-600 uppercase font-semibold mb-1">Ngày Đi Làm</div>
                    <div className="text-2xl font-bold text-blue-700">{stats.totalDays}</div>
                    <div className="text-xs text-blue-600 mt-1">ngày</div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-xs text-yellow-600 uppercase font-semibold mb-1">Nửa Ngày</div>
                    <div className="text-2xl font-bold text-yellow-700">{stats.halfDays}</div>
                    <div className="text-xs text-yellow-600 mt-1">ngày</div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-xs text-orange-600 uppercase font-semibold mb-1">Nghỉ Phép</div>
                    <div className="text-2xl font-bold text-orange-700">{stats.leaveDays}</div>
                    <div className="text-xs text-orange-600 mt-1">ngày</div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-xs text-purple-600 uppercase font-semibold mb-1">Cuối Tuần</div>
                    <div className="text-2xl font-bold text-purple-700">{stats.weekendDays}</div>
                    <div className="text-xs text-purple-600 mt-1">ngày</div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Chưa Chấm</div>
                    <div className="text-2xl font-bold text-gray-700">{stats.emptyDays}</div>
                    <div className="text-xs text-gray-600 mt-1">ngày</div>
                  </div>
                </div>
              </div>

              {/* Attendance Grid */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Bảng Chấm Công Chi Tiết</h3>
                {(() => {
                  const gridEmployee = gridData.find(e => e.code === emp.code);
                  const attendance = gridEmployee?.attendance || {};
                  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
                  
                  // Generate days array
                  const days = [];
                  for (let i = 1; i <= daysInMonth; i++) {
                    const date = new Date(viewYear, viewMonth, i);
                    const dayIndex = date.getDay();
                    days.push({
                      date: i,
                      dayOfWeek: DAYS_OF_WEEK_EN[dayIndex],
                      isWeekend: dayIndex === 0 || dayIndex === 6
                    });
                  }

                  const getCellColor = (val: string, isWeekend: boolean) => {
                    if (val === 'CN' || val === 'Red') return 'bg-red-600 text-white font-bold';
                    if (val === '0.5') return 'bg-blue-100 text-blue-800';
                    if (val === '1') return isWeekend ? 'bg-yellow-200' : 'bg-green-100';
                    if (val === 'P') return 'bg-orange-200';
                    if (!val && isWeekend) return 'bg-yellow-50';
                    return 'bg-white';
                  };

                  return (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-2 border text-center font-semibold text-gray-700">Ngày</th>
                            {days.map((day) => (
                              <th
                                key={day.date}
                                className={`px-2 py-2 border text-center text-xs font-semibold ${
                                  day.isWeekend ? 'bg-yellow-100' : 'bg-gray-50'
                                }`}
                              >
                                <div>{day.date}</div>
                                <div className="text-xs text-gray-500">{day.dayOfWeek}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-2 py-2 border bg-gray-50 font-semibold text-center">Chấm Công</td>
                            {days.map((day) => {
                              const val = attendance[day.date] || '';
                              return (
                                <td
                                  key={day.date}
                                  className={`px-2 py-2 border text-center font-bold ${getCellColor(val, day.isWeekend)}`}
                                >
                                  {val || '-'}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Payroll Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <DollarSign size={20} className="mr-2 text-amber-600" />
                  Tính Lương Tháng {viewMonth + 1}/{viewYear}
                </h3>
                {(() => {
                  const dailyRate = emp.dailyRate || 200000;
                  const bonus = emp.bonus || 0;
                  const penalty = emp.penalty || 0;
                  const baseSalary = stats.totalWork * dailyRate;
                  const totalSalary = baseSalary + bonus - penalty;

                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Đơn Giá/Công</div>
                          <div className="text-lg font-bold text-gray-800">{dailyRate.toLocaleString('vi-VN')}</div>
                          <div className="text-xs text-gray-500">VNĐ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Tổng Công</div>
                          <div className="text-lg font-bold text-blue-700">{stats.totalWork}</div>
                          <div className="text-xs text-gray-500">công</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-green-600 uppercase font-semibold mb-1">Thưởng</div>
                          <div className="text-lg font-bold text-green-700">+{bonus.toLocaleString('vi-VN')}</div>
                          <div className="text-xs text-gray-500">VNĐ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-red-600 uppercase font-semibold mb-1">Phạt</div>
                          <div className="text-lg font-bold text-red-700">-{penalty.toLocaleString('vi-VN')}</div>
                          <div className="text-xs text-gray-500">VNĐ</div>
                        </div>
                      </div>

                      <div className="border-t border-amber-300 pt-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">{stats.totalWork}</span> công × <span className="font-semibold">{dailyRate.toLocaleString('vi-VN')}</span> + <span className="text-green-600 font-semibold">{bonus.toLocaleString('vi-VN')}</span> - <span className="text-red-600 font-semibold">{penalty.toLocaleString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-semibold">=</span>
                            <div className="bg-amber-600 text-white px-4 py-2 rounded-lg">
                              <div className="text-xs opacity-80">THỰC LÃNH</div>
                              <div className="text-xl font-bold">{totalSalary.toLocaleString('vi-VN')} VNĐ</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setViewingEmployee(null);
                      startEdit(emp);
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center"
                  >
                    <Edit size={16} className="mr-2" />
                    Sửa Thông Tin
                  </button>
                )}
                <button
                  onClick={() => setViewingEmployee(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};
