/**
 * Payroll Excel operations
 * Export payroll/salary data
 */

import * as XLSX from 'xlsx';
import type { Employee } from '../../types';
import { calculateTotal } from './common';

/**
 * Export payroll data to Excel
 * Includes: Employee info, total work days, daily rate, bonus, penalty, net salary
 */
export const exportPayrollToExcel = (
  employees: Employee[],
  year: number,
  month: number,
  defaultDailyRate: number = 200000,
  filename?: string
): void => {
  const monthName = `Thang${month + 1}`;
  const defaultFilename = `BangLuong_${monthName}_${year}.xlsx`;

  const wsData: (string | number)[][] = [];

  // Title
  wsData.push([`BẢNG LƯƠNG THÁNG ${month + 1}/${year} - BẠCH HỔ SECURITY`]);
  wsData.push([`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`]);
  wsData.push([]);

  // Headers
  wsData.push([
    'STT',
    'Mã NV',
    'Họ Tên',
    'Mục Tiêu',
    'Tổng Công',
    'Đơn Giá (VND)',
    'Lương Cơ Bản',
    'Thưởng',
    'Phạt',
    'Thực Lãnh',
    'Ghi Chú'
  ]);

  // Data rows
  let totalNetSalary = 0;
  let totalBonus = 0;
  let totalPenalty = 0;

  employees.forEach((emp, index) => {
    const totalDays = calculateTotal(emp.attendance);
    const dailyRate = emp.dailyRate || defaultDailyRate;
    const baseSalary = totalDays * dailyRate;
    const bonus = emp.bonus || 0;
    const penalty = emp.penalty || 0;
    const netSalary = baseSalary + bonus - penalty;

    totalNetSalary += netSalary;
    totalBonus += bonus;
    totalPenalty += penalty;

    wsData.push([
      index + 1,
      emp.code || '',
      emp.name || '',
      emp.department || '',
      totalDays,
      dailyRate,
      baseSalary,
      bonus,
      penalty,
      netSalary,
      emp.note || ''
    ]);
  });

  // Summary row
  wsData.push([]);
  wsData.push([
    '',
    '',
    'TỔNG CỘNG',
    '',
    employees.reduce((acc, emp) => acc + calculateTotal(emp.attendance), 0),
    '',
    '',
    totalBonus,
    totalPenalty,
    totalNetSalary,
    ''
  ]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },
    { wch: 10 },
    { wch: 22 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 }
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Lương T${month + 1}`);
  XLSX.writeFile(wb, filename || defaultFilename);
};
