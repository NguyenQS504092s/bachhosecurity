/**
 * Employee Excel operations
 * Export and import employee/HR data
 */

import * as XLSX from 'xlsx';
import type { Employee } from '../../types';

/**
 * Export employees list to Excel
 */
export const exportEmployeesToExcel = (
  employees: Employee[],
  filename?: string
): void => {
  const defaultFilename = `DanhSachNhanSu_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const wsData: (string | number)[][] = [];

  // Title
  wsData.push(['DANH SÁCH NHÂN SỰ - BẠCH HỔ SECURITY']);
  wsData.push([`Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`]);
  wsData.push([]);

  // Headers
  wsData.push(['STT', 'Mã NV', 'Họ Tên', 'Phòng Ban', 'Quyền Hạn', 'Mật Khẩu']);

  // Data rows
  employees.forEach((emp, index) => {
    wsData.push([
      index + 1,
      emp.code || '',
      emp.name || '',
      emp.department || '',
      emp.role === 'admin' ? 'Quản Trị' : 'Nhân Viên',
      emp.password || ''
    ]);
  });

  // Summary
  wsData.push([]);
  wsData.push([`Tổng số: ${employees.length} nhân viên`]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 10 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Nhân Sự');
  XLSX.writeFile(wb, filename || defaultFilename);
};

/**
 * Import employees from Excel file
 */
export const importEmployeesFromExcel = (
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
        let roleColIndex = -1;
        let passColIndex = -1;

        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
          const row = jsonData[i];
          if (!row) continue;

          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || '').toLowerCase();
            if (cell.includes('mã')) codeColIndex = j;
            if (cell.includes('tên') || cell.includes('họ')) nameColIndex = j;
            if (cell.includes('phòng') || cell.includes('ban')) deptColIndex = j;
            if (cell.includes('quyền')) roleColIndex = j;
            if (cell.includes('mật') || cell.includes('khẩu')) passColIndex = j;
          }

          if (codeColIndex >= 0 && nameColIndex >= 0) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex < 0) {
          resolve({ employees: [], errors: ['Không tìm thấy header hợp lệ. File cần có cột "Mã NV" và "Họ Tên".'] });
          return;
        }

        // Parse data rows
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const code = String(row[codeColIndex] || '').trim();
          const name = String(row[nameColIndex] || '').trim();

          if (!code && !name) continue;

          if (!code) {
            errors.push(`Dòng ${i + 1}: Thiếu mã nhân viên`);
            continue;
          }

          if (!name) {
            errors.push(`Dòng ${i + 1}: Thiếu họ tên`);
            continue;
          }

          if (existingEmployees.some(e => e.code === code)) {
            errors.push(`Dòng ${i + 1}: Mã "${code}" đã tồn tại`);
            continue;
          }

          const roleStr = String(row[roleColIndex] || '').toLowerCase();
          const role: 'admin' | 'staff' = roleStr.includes('quản') || roleStr.includes('admin') ? 'admin' : 'staff';

          employees.push({
            id: Math.random().toString(36).substr(2, 9),
            code,
            name,
            department: deptColIndex >= 0 ? String(row[deptColIndex] || 'Văn Phòng') : 'Văn Phòng',
            shift: '08h00 - 17h00',
            attendance: {},
            password: passColIndex >= 0 ? String(row[passColIndex] || '123') : '123',
            role
          });
        }

        resolve({ employees, errors });
      } catch (err) {
        reject(new Error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.'));
      }
    };

    reader.onerror = () => reject(new Error('Lỗi đọc file'));
    reader.readAsArrayBuffer(file);
  });
};
