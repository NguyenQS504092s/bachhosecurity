/**
 * Employee Detail Modal Component
 * Shows detailed employee info, attendance grid, and payroll
 */

import React, { useState } from 'react';
import { User, X, Calendar, DollarSign, Edit } from 'lucide-react';
import type { Employee } from '../../types';
import { DAYS_OF_WEEK_EN } from '../../constants';
import { calculateEmployeeStats, calculatePayroll, getAttendanceCellColor } from './hr-helpers';

interface EmployeeDetailModalProps {
  employee: Employee;
  gridData: Employee[];
  year: number;
  month: number;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  gridData,
  year,
  month,
  isAdmin,
  onClose,
  onEdit
}) => {
  const [viewMonth, setViewMonth] = useState(month);
  const [viewYear, setViewYear] = useState(year);

  const stats = calculateEmployeeStats(employee, gridData, viewMonth, viewYear);
  const payroll = calculatePayroll(employee, stats);

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  // Generate attendance grid
  const gridEmployee = gridData.find(e => e.code === employee.code);
  const attendance = gridEmployee?.attendance || {};
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <User size={24} className="mr-2 text-blue-600" />
            Thông Tin Chi Tiết Nhân Viên
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Employee Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase">Mã Nhân Viên</label>
              <div className="text-lg font-bold text-gray-800">{employee.code}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Họ Tên</label>
              <div className="text-lg font-semibold text-gray-800">{employee.name}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Phòng Ban</label>
              <div className="text-sm text-gray-700">{employee.department}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Quyền Hạn</label>
              <div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {employee.role === 'admin' ? 'Quản Trị' : 'Nhân Viên'}
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
                {Array.from({ length: 12 }).map((_, i) => (
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
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 border text-center font-semibold text-gray-700">Ngày</th>
                  {days.map((day) => (
                    <th
                      key={day.date}
                      className={`px-2 py-2 border text-center text-xs font-semibold ${day.isWeekend ? 'bg-yellow-100' : 'bg-gray-50'
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
                        className={`px-2 py-2 border text-center font-bold ${getAttendanceCellColor(val, day.isWeekend)}`}
                      >
                        {val || '-'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payroll Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <DollarSign size={20} className="mr-2 text-amber-600" />
            Tính Lương Tháng {viewMonth + 1}/{viewYear}
          </h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Đơn Giá/Công</div>
                <div className="text-lg font-bold text-gray-800">{payroll.dailyRate.toLocaleString('vi-VN')}</div>
                <div className="text-xs text-gray-500">VNĐ</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Tổng Công</div>
                <div className="text-lg font-bold text-blue-700">{stats.totalWork}</div>
                <div className="text-xs text-gray-500">công</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-green-600 uppercase font-semibold mb-1">Thưởng</div>
                <div className="text-lg font-bold text-green-700">+{payroll.bonus.toLocaleString('vi-VN')}</div>
                <div className="text-xs text-gray-500">VNĐ</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-red-600 uppercase font-semibold mb-1">Phạt</div>
                <div className="text-lg font-bold text-red-700">-{payroll.penalty.toLocaleString('vi-VN')}</div>
                <div className="text-xs text-gray-500">VNĐ</div>
              </div>
            </div>

            <div className="border-t border-amber-300 pt-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{stats.totalWork}</span> công × <span className="font-semibold">{payroll.dailyRate.toLocaleString('vi-VN')}</span> + <span className="text-green-600 font-semibold">{payroll.bonus.toLocaleString('vi-VN')}</span> - <span className="text-red-600 font-semibold">{payroll.penalty.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-semibold">=</span>
                  <div className="bg-amber-600 text-white px-4 py-2 rounded-lg">
                    <div className="text-xs opacity-80">THỰC LÃNH</div>
                    <div className="text-xl font-bold">{payroll.totalSalary.toLocaleString('vi-VN')} VNĐ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {isAdmin && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center"
            >
              <Edit size={16} className="mr-2" />
              Sửa Thông Tin
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
