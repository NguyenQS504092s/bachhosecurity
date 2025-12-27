/**
 * Payroll Excel operations
 * Export payroll/salary data
 */

import * as XLSX from 'xlsx';
import type { Employee } from '../../types';
import { calculateTotal } from './common';

/**
 * Export payroll data to Excel
 * Headers: ShiftID, Thang_luong, STT, Ho_va_ten, So_tai_khoan, Ten_muc_tieu, Gio_cong_chuan,
 *          Luong_ca, Luong_trach_nhiem, Luong_ho_tro, Luong_quan_ly, Tien_thuong, Tong_luong,
 *          Ung_luong_lan1, Ung_luong_lan2, Ung_luong_lan3, Hoan_tien, BHXH, Dong_phuc,
 *          Tien_phat, Tong_con_nhan, Ghi_chu
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

  // Headers - New format with bonus
  wsData.push([
    'ShiftID',
    'Thang_luong',
    'STT',
    'Ho_va_ten',
    'So_tai_khoan',
    'Ten_muc_tieu',
    'Gio_cong_chuan',
    'Luong_ca',
    'Luong_trach_nhiem',
    'Luong_ho_tro',
    'Luong_quan_ly',
    'Tien_thuong',
    'Tong_luong',
    'Ung_luong_lan1',
    'Ung_luong_lan2',
    'Ung_luong_lan3',
    'Hoan_tien',
    'BHXH',
    'Dong_phuc',
    'Tien_phat',
    'Tong_con_nhan',
    'Ghi_chu'
  ]);

  // Data rows
  let totalSalary = 0;
  let totalBonus = 0;
  let totalAdvance1 = 0;
  let totalAdvance2 = 0;
  let totalAdvance3 = 0;
  let totalRefund = 0;
  let totalBHXH = 0;
  let totalUniform = 0;
  let totalPenalty = 0;
  let totalNetReceived = 0;

  employees.forEach((emp, index) => {
    const standardHours = emp.standardHours || calculateTotal(emp.attendance);
    const shiftSalary = emp.shiftSalary || (standardHours * (emp.dailyRate || defaultDailyRate));
    const responsibilitySalary = emp.responsibilitySalary || 0;
    const supportSalary = emp.supportSalary || 0;
    const managementSalary = emp.managementSalary || 0;
    const bonus = emp.bonus || 0;
    const totalGrossSalary = shiftSalary + responsibilitySalary + supportSalary + managementSalary + bonus;

    const advance1 = emp.advance1 || 0;
    const advance2 = emp.advance2 || 0;
    const advance3 = emp.advance3 || 0;
    const refund = emp.refund || 0;
    const socialInsurance = emp.socialInsurance || 0;
    const uniform = emp.uniform || 0;
    const penalty = emp.penalty || 0;

    const totalDeductions = advance1 + advance2 + advance3 + socialInsurance + uniform + penalty - refund;
    const netReceived = totalGrossSalary - totalDeductions;

    totalSalary += totalGrossSalary;
    totalBonus += bonus;
    totalAdvance1 += advance1;
    totalAdvance2 += advance2;
    totalAdvance3 += advance3;
    totalRefund += refund;
    totalBHXH += socialInsurance;
    totalUniform += uniform;
    totalPenalty += penalty;
    totalNetReceived += netReceived;

    wsData.push([
      emp.shift || '08:00 - 17:00', // ShiftID
      `${month + 1}/${year}`, // Thang_luong
      index + 1, // STT
      emp.name || '', // Ho_va_ten
      emp.bankAccount || '', // So_tai_khoan
      emp.department || '', // Ten_muc_tieu
      standardHours, // Gio_cong_chuan
      shiftSalary, // Luong_ca
      responsibilitySalary, // Luong_trach_nhiem
      supportSalary, // Luong_ho_tro
      managementSalary, // Luong_quan_ly
      bonus, // Tien_thuong
      totalGrossSalary, // Tong_luong
      advance1, // Ung_luong_lan1
      advance2, // Ung_luong_lan2
      advance3, // Ung_luong_lan3
      refund, // Hoan_tien
      socialInsurance, // BHXH
      uniform, // Dong_phuc
      penalty, // Tien_phat
      netReceived, // Tong_con_nhan
      emp.note || '' // Ghi_chu
    ]);
  });

  // Summary row
  wsData.push([]);
  wsData.push([
    '', // ShiftID
    '', // Thang_luong
    '', // STT
    'TỔNG CỘNG', // Ho_va_ten
    '', // So_tai_khoan
    '', // Ten_muc_tieu
    employees.reduce((acc, emp) => acc + (emp.standardHours || calculateTotal(emp.attendance)), 0), // Gio_cong_chuan
    '', // Luong_ca
    '', // Luong_trach_nhiem
    '', // Luong_ho_tro
    '', // Luong_quan_ly
    totalBonus, // Tien_thuong
    totalSalary, // Tong_luong
    totalAdvance1, // Ung_luong_lan1
    totalAdvance2, // Ung_luong_lan2
    totalAdvance3, // Ung_luong_lan3
    totalRefund, // Hoan_tien
    totalBHXH, // BHXH
    totalUniform, // Dong_phuc
    totalPenalty, // Tien_phat
    totalNetReceived, // Tong_con_nhan
    '' // Ghi_chu
  ]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 },  // ShiftID
    { wch: 12 },  // Thang_luong
    { wch: 5 },   // STT
    { wch: 22 },  // Ho_va_ten
    { wch: 18 },  // So_tai_khoan
    { wch: 15 },  // Ten_muc_tieu
    { wch: 14 },  // Gio_cong_chuan
    { wch: 14 },  // Luong_ca
    { wch: 16 },  // Luong_trach_nhiem
    { wch: 12 },  // Luong_ho_tro
    { wch: 14 },  // Luong_quan_ly
    { wch: 12 },  // Tien_thuong
    { wch: 14 },  // Tong_luong
    { wch: 14 },  // Ung_luong_lan1
    { wch: 14 },  // Ung_luong_lan2
    { wch: 14 },  // Ung_luong_lan3
    { wch: 12 },  // Hoan_tien
    { wch: 12 },  // BHXH
    { wch: 12 },  // Dong_phuc
    { wch: 12 },  // Tien_phat
    { wch: 15 },  // Tong_con_nhan
    { wch: 20 }   // Ghi_chu
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Lương T${month + 1}`);
  XLSX.writeFile(wb, filename || defaultFilename);
};
