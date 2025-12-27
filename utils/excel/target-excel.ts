/**
 * Target Excel operations
 * Export and import target/location data
 */

import * as XLSX from 'xlsx';
import type { Employee, Target, RosterItem } from '../../types';

/**
 * Export targets to Excel
 */
export const exportTargetsToExcel = (
  targets: Target[],
  employees: Employee[],
  filename?: string
): void => {
  const defaultFilename = `DanhSachMucTieu_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData: (string | number)[][] = [];
  summaryData.push(['DANH SÁCH MỤC TIÊU - BẠCH HỔ SECURITY']);
  summaryData.push([`Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`]);
  summaryData.push([]);
  summaryData.push(['STT', 'Tên Mục Tiêu', 'Số Nhân Sự']);

  targets.forEach((target, index) => {
    summaryData.push([index + 1, target.name, target.roster.length]);
  });

  summaryData.push([]);
  summaryData.push([`Tổng số: ${targets.length} mục tiêu`]);

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Tổng Quan');

  // Detail sheet for each target
  targets.forEach((target) => {
    const detailData: (string | number)[][] = [];
    detailData.push([`MỤC TIÊU: ${target.name}`]);
    detailData.push([]);
    detailData.push(['STT', 'Mã NV', 'Họ Tên', 'Ca Trực']);

    target.roster.forEach((item, index) => {
      const emp = employees.find(e => e.id === item.employeeId);
      detailData.push([
        index + 1,
        emp?.code || '',
        emp?.name || 'Không tìm thấy',
        item.shift || ''
      ]);
    });

    const detailWs = XLSX.utils.aoa_to_sheet(detailData);
    detailWs['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 25 }, { wch: 15 }];

    // Truncate sheet name to 31 chars (Excel limit)
    const sheetName = target.name.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, detailWs, sheetName);
  });

  XLSX.writeFile(wb, filename || defaultFilename);
};

/**
 * Download target import template
 */
export const downloadTargetTemplate = (): void => {
  const wb = XLSX.utils.book_new();

  // Instructions sheet
  const instructionData: string[][] = [];
  instructionData.push(['HƯỚNG DẪN NHẬP MỤC TIÊU']);
  instructionData.push([]);
  instructionData.push(['Cách 1: Multi-sheet (mỗi sheet = 1 mục tiêu)']);
  instructionData.push(['- Tên sheet = Tên mục tiêu']);
  instructionData.push(['- Mỗi sheet có các cột: STT, Mã NV, Họ Tên, Ca Trực']);
  instructionData.push([]);
  instructionData.push(['Cách 2: Single-sheet (1 sheet chứa tất cả)']);
  instructionData.push(['- Cột: Mục Tiêu, Mã NV, Họ Tên, Ca Trực']);
  instructionData.push([]);
  instructionData.push(['LƯU Ý:']);
  instructionData.push(['- Mã NV phải tồn tại trong danh sách nhân sự']);
  instructionData.push(['- Ca Trực định dạng 24h: "08:00 - 17:00"']);

  const instructionWs = XLSX.utils.aoa_to_sheet(instructionData);
  instructionWs['!cols'] = [{ wch: 60 }];
  XLSX.utils.book_append_sheet(wb, instructionWs, 'Hướng Dẫn');

  // Sample target sheet 1
  const target1Data: (string | number)[][] = [];
  target1Data.push(['MỤC TIÊU: Văn Phòng Chính']);
  target1Data.push([]);
  target1Data.push(['STT', 'Mã NV', 'Họ Tên', 'Ca Trực']);
  target1Data.push([1, '001', 'Nguyễn Văn A', '08:00 - 17:00']);
  target1Data.push([2, '002', 'Trần Thị B', '06:00 - 14:00']);
  target1Data.push([3, '', '', '']);

  const target1Ws = XLSX.utils.aoa_to_sheet(target1Data);
  target1Ws['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, target1Ws, 'Văn Phòng Chính');

  // Sample target sheet 2
  const target2Data: (string | number)[][] = [];
  target2Data.push(['MỤC TIÊU: Kho Hàng']);
  target2Data.push([]);
  target2Data.push(['STT', 'Mã NV', 'Họ Tên', 'Ca Trực']);
  target2Data.push([1, '003', 'Lê Văn C', '22:00 - 06:00']);
  target2Data.push([2, '', '', '']);

  const target2Ws = XLSX.utils.aoa_to_sheet(target2Data);
  target2Ws['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, target2Ws, 'Kho Hàng');

  XLSX.writeFile(wb, 'Mau_NhapMucTieu.xlsx');
};

/**
 * Export targets to JSON (for backup/restore)
 */
export const exportTargetsToJSON = (targets: Target[]): void => {
  const dataStr = JSON.stringify(targets, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MucTieu_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Import targets from JSON
 */
export const importTargetsFromJSON = (
  file: File
): Promise<{ targets: Target[]; errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        if (!Array.isArray(jsonData)) {
          resolve({ targets: [], errors: ['File không đúng định dạng. Cần là mảng JSON.'] });
          return;
        }

        const targets: Target[] = [];
        const errors: string[] = [];

        jsonData.forEach((item: any, index: number) => {
          if (!item.name) {
            errors.push(`Mục ${index + 1}: Thiếu tên mục tiêu`);
            return;
          }

          targets.push({
            id: item.id || Math.random().toString(36).substr(2, 9),
            name: item.name,
            roster: Array.isArray(item.roster) ? item.roster : []
          });
        });

        resolve({ targets, errors });
      } catch (err) {
        reject(new Error('Không thể đọc file JSON. Vui lòng kiểm tra định dạng.'));
      }
    };

    reader.onerror = () => reject(new Error('Lỗi đọc file'));
    reader.readAsText(file);
  });
};

/**
 * Import targets from Excel file
 * Supports multi-sheet format (each sheet = 1 target) or single sheet format
 */
export const importTargetsFromExcel = (
  file: File,
  existingEmployees: Employee[]
): Promise<{ targets: Target[]; errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const targets: Target[] = [];
        const errors: string[] = [];

        // Try multi-sheet format first
        if (workbook.SheetNames.length > 1 || !workbook.SheetNames.includes('Tổng Quan')) {
          workbook.SheetNames.forEach((sheetName) => {
            if (sheetName === 'Tổng Quan') return;

            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            const roster: RosterItem[] = [];

            // Find header row
            let headerRowIndex = -1;
            let codeColIndex = -1;
            let shiftColIndex = -1;

            for (let i = 0; i < Math.min(5, jsonData.length); i++) {
              const row = jsonData[i];
              if (!row) continue;

              for (let j = 0; j < row.length; j++) {
                const cell = String(row[j] || '').toLowerCase();
                if (cell.includes('mã')) codeColIndex = j;
                if (cell.includes('ca') || cell.includes('trực') || cell.includes('giờ')) shiftColIndex = j;
              }

              if (codeColIndex >= 0) {
                headerRowIndex = i;
                break;
              }
            }

            // Parse data rows
            const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 1;
            for (let i = startRow; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (!row || row.length === 0) continue;

              const code = String(row[codeColIndex >= 0 ? codeColIndex : 1] || '').trim();
              const shift = shiftColIndex >= 0 ? String(row[shiftColIndex] || '').trim() : '';

              if (!code) continue;

              const emp = existingEmployees.find(e => e.code === code);
              if (emp) {
                roster.push({
                  employeeId: emp.id,
                  shift: shift || '08:00 - 17:00'
                });
              } else {
                errors.push(`Sheet "${sheetName}": Không tìm thấy nhân viên mã "${code}"`);
              }
            }

            if (roster.length > 0) {
              targets.push({
                id: Math.random().toString(36).substr(2, 9),
                name: sheetName,
                roster
              });
            }
          });
        } else {
          // Single sheet format
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          // Find header
          let headerRowIndex = -1;
          let targetColIndex = -1;
          let codeColIndex = -1;
          let shiftColIndex = -1;

          for (let i = 0; i < Math.min(5, jsonData.length); i++) {
            const row = jsonData[i];
            if (!row) continue;

            for (let j = 0; j < row.length; j++) {
              const cell = String(row[j] || '').toLowerCase();
              if (cell.includes('mục') || cell.includes('tiêu') || cell.includes('địa')) targetColIndex = j;
              if (cell.includes('mã')) codeColIndex = j;
              if (cell.includes('ca') || cell.includes('trực') || cell.includes('giờ')) shiftColIndex = j;
            }

            if (codeColIndex >= 0) {
              headerRowIndex = i;
              break;
            }
          }

          // Group by target name
          const targetMap = new Map<string, RosterItem[]>();

          const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 1;
          for (let i = startRow; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const targetName = targetColIndex >= 0 ? String(row[targetColIndex] || '').trim() : 'Mục Tiêu Mới';
            const code = String(row[codeColIndex >= 0 ? codeColIndex : 0] || '').trim();
            const shift = shiftColIndex >= 0 ? String(row[shiftColIndex] || '').trim() : '';

            if (!code) continue;

            const emp = existingEmployees.find(e => e.code === code);
            if (emp) {
              if (!targetMap.has(targetName)) {
                targetMap.set(targetName, []);
              }
              targetMap.get(targetName)!.push({
                employeeId: emp.id,
                shift: shift || '08h00 - 17h00'
              });
            } else {
              errors.push(`Dòng ${i + 1}: Không tìm thấy nhân viên mã "${code}"`);
            }
          }

          targetMap.forEach((roster, name) => {
            targets.push({
              id: Math.random().toString(36).substr(2, 9),
              name,
              roster
            });
          });
        }

        resolve({ targets, errors });
      } catch (err) {
        reject(new Error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng.'));
      }
    };

    reader.onerror = () => reject(new Error('Lỗi đọc file'));
    reader.readAsArrayBuffer(file);
  });
};
