/**
 * Timesheet Excel operations
 * Export and import timesheet/attendance data
 */

import * as XLSX from 'xlsx';
import type { Employee } from '../../types';
import { generateDaysInfo, calculateTotal } from './common';

/**
 * Export timesheet data to Excel file
 */
export const exportToExcel = (
  data: Employee[],
  year: number,
  month: number,
  filename?: string
): void => {
  const days = generateDaysInfo(year, month);
  const monthName = `Thang${month + 1}`;
  const defaultFilename = `BangChamCong_${monthName}_${year}.xlsx`;

  // Create header rows
  const titleRow = [`BẢNG CHẤM CÔNG THÁNG ${month + 1}/${year} - BẠCH HỔ SECURITY`];
  const emptyRow: string[] = [];

  const headerRow1 = ['STT', 'Mã', 'Họ Và Tên', 'Mục Tiêu'];
  days.forEach(day => {
    headerRow1.push(day.date.toString().padStart(2, '0'));
  });
  headerRow1.push('Tổng Công');

  const headerRow2 = ['', '', '', ''];
  days.forEach(day => {
    headerRow2.push(day.dayOfWeek);
  });
  headerRow2.push('');

  // Data rows
  const dataRows = data.map((emp, index) => {
    const row: (string | number)[] = [
      index + 1,
      emp.code || '',
      emp.name || '',
      emp.department || ''
    ];

    days.forEach(day => {
      const val = emp.attendance[day.date] || '';
      row.push(val);
    });

    row.push(calculateTotal(emp.attendance));
    return row;
  });

  // Summary row
  const totalAttendance = data.reduce((acc, emp) => acc + calculateTotal(emp.attendance), 0);
  const summaryRow: (string | number)[] = ['', '', '', `Tổng Số: ${totalAttendance} công`];
  days.forEach(() => summaryRow.push(''));
  summaryRow.push(totalAttendance);

  // Combine all rows
  const wsData = [
    titleRow,
    emptyRow,
    headerRow1,
    headerRow2,
    ...dataRows,
    emptyRow,
    summaryRow
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = [
    { wch: 5 },   // STT
    { wch: 8 },   // Mã
    { wch: 22 },  // Họ Và Tên
    { wch: 15 },  // Mục Tiêu
    ...days.map(() => ({ wch: 5 })),
    { wch: 10 }   // Tổng Công
  ];
  ws['!cols'] = colWidths;

  // Merge title cell
  const totalCols = 4 + days.length + 1;
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Tháng ${month + 1}`);
  XLSX.writeFile(wb, filename || defaultFilename);
};

/**
 * Export timesheet with styling
 */
export const exportToExcelStyled = (
  data: Employee[],
  year: number,
  month: number,
  filename?: string
): void => {
  const days = generateDaysInfo(year, month);
  const monthName = `Thang${month + 1}`;
  const defaultFilename = `BangChamCong_${monthName}_${year}.xlsx`;

  const wb = XLSX.utils.book_new();
  const wsData: (string | number)[][] = [];

  // Title
  wsData.push([`BẢNG CHẤM CÔNG THÁNG ${month + 1}/${year}`]);
  wsData.push(['BẠCH HỔ SECURITY']);
  wsData.push([]);

  // Headers
  const header1: (string | number)[] = ['STT', 'Mã NV', 'Họ Và Tên', 'Mục Tiêu'];
  days.forEach(day => header1.push(day.date));
  header1.push('Tổng');
  wsData.push(header1);

  const header2: (string | number)[] = ['', '', '', ''];
  days.forEach(day => header2.push(day.dayOfWeek));
  header2.push('');
  wsData.push(header2);

  // Data rows
  data.forEach((emp, index) => {
    const row: (string | number)[] = [
      index + 1,
      emp.code || '',
      emp.name || '',
      emp.department || ''
    ];

    days.forEach(day => {
      const val = emp.attendance[day.date];
      row.push(val || '');
    });

    row.push(calculateTotal(emp.attendance));
    wsData.push(row);
  });

  wsData.push([]);

  // Summary
  const totalAttendance = data.reduce((acc, emp) => acc + calculateTotal(emp.attendance), 0);
  const summaryRow: (string | number)[] = ['', '', 'TỔNG CỘNG:', ''];
  days.forEach(() => summaryRow.push(''));
  summaryRow.push(totalAttendance);
  wsData.push(summaryRow);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 8 },
    { wch: 22 },
    { wch: 12 },
    ...days.map(() => ({ wch: 4 })),
    { wch: 8 }
  ];

  ws['!rows'] = [
    { hpt: 25 },
    { hpt: 20 },
    { hpt: 15 },
    { hpt: 22 },
    { hpt: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Tháng ${month + 1}`);
  XLSX.writeFile(wb, filename || defaultFilename);
};

/**
 * Import timesheet data from Excel
 */
export const importTimesheetFromExcel = (
  file: File,
  existingEmployees: Employee[]
): Promise<{ employees: Employee[]; errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const employees: Employee[] = [];
        const errors: string[] = [];

        // Find header row
        let headerRowIndex = -1;
        let codeColIndex = -1;
        let nameColIndex = -1;
        let deptColIndex = -1;
        let dayStartColIndex = -1;

        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
          const row = jsonData[i];
          if (!row) continue;

          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || '').toLowerCase();
            if (cell.includes('mã')) codeColIndex = j;
            if (cell.includes('tên') || cell.includes('họ')) nameColIndex = j;
            if (cell.includes('mục') || cell.includes('tiêu') || cell.includes('phòng')) deptColIndex = j;

            const numVal = parseInt(String(row[j]));
            if (numVal === 1 && dayStartColIndex < 0) {
              dayStartColIndex = j;
            }
          }

          if (codeColIndex >= 0 || nameColIndex >= 0) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex < 0) {
          resolve({ employees: [], errors: ['Không tìm thấy header hợp lệ.'] });
          return;
        }

        // Parse data rows
        for (let i = headerRowIndex + 2; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const code = String(row[codeColIndex] || '').trim();
          const name = String(row[nameColIndex] || '').trim();

          if (!code && !name) continue;

          const existingEmp = existingEmployees.find(e => e.code === code || e.name === name);

          // Parse attendance
          const attendance: Record<number, string> = {};
          if (dayStartColIndex >= 0) {
            for (let day = 1; day <= 31; day++) {
              const colIndex = dayStartColIndex + day - 1;
              if (colIndex < row.length) {
                const val = String(row[colIndex] || '').trim();
                if (val) {
                  attendance[day] = val;
                }
              }
            }
          }

          employees.push({
            id: existingEmp?.id || Math.random().toString(36).substr(2, 9),
            code: code || existingEmp?.code || `NV${employees.length + 1}`,
            name: name || existingEmp?.name || '',
            department: (deptColIndex >= 0 ? String(row[deptColIndex] || '') : '') || existingEmp?.department || 'Chưa xác định',
            shift: existingEmp?.shift || '08h00 - 17h00',
            attendance,
            password: existingEmp?.password || '123',
            role: existingEmp?.role || 'staff'
          });
        }

        resolve({ employees, errors });
      } catch (err) {
        reject(new Error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng.'));
      }
    };

    reader.onerror = () => reject(new Error('Lỗi đọc file'));
    reader.readAsArrayBuffer(file);
  });
};
