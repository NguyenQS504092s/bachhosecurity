/**
 * HR Toolbar Component
 * Search and action buttons for HR management
 */

import React, { useRef } from 'react';
import { Search, Download, Upload, Plus, FileSpreadsheet } from 'lucide-react';
import type { Employee } from '../../types';
import { exportEmployeesToExcel, importEmployeesFromExcel, downloadEmployeeTemplate } from '../../utils/excel-export';

interface HRToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isAdmin: boolean;
  employees: Employee[];
  onAddNew: () => void;
  onImportSuccess: (employees: Employee[]) => void;
  onImportError: (error: string) => void;
}

export const HRToolbar: React.FC<HRToolbarProps> = ({
  searchTerm,
  onSearchChange,
  isAdmin,
  employees,
  onAddNew,
  onImportSuccess,
  onImportError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    exportEmployeesToExcel(employees);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { employees: importedEmployees, errors } = await importEmployeesFromExcel(file, employees);

      if (errors.length > 0) {
        onImportError(errors.join('\n'));
      }

      if (importedEmployees.length > 0) {
        onImportSuccess(importedEmployees);
      }
    } catch (err: any) {
      onImportError(err.message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm nhân viên..."
          className="pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-amber-500 focus:outline-none w-64"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>

      {isAdmin && (
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
            onClick={downloadEmployeeTemplate}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow transition"
            title="Tải mẫu Excel để nhập nhân sự"
          >
            <FileSpreadsheet size={18} />
            <span>Tải Mẫu</span>
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
            onClick={onAddNew}
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
  );
};
