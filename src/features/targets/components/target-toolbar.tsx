/**
 * Target Toolbar Component
 * Import/Export buttons and actions
 */

import React, { useRef } from 'react';
import { Download, Upload, FileSpreadsheet, Plus } from 'lucide-react';
import { Target, Employee } from '../../../types';
import { exportTargetsToExcel, exportTargetsToJSON, importTargetsFromJSON, importTargetsFromExcel, downloadTargetTemplate } from '../../../utils/excel-export';

interface TargetToolbarProps {
  targets: Target[];
  employees: Employee[];
  onImport: (targets: Target[], errors: string[]) => void;
  onAdd: () => void;
}

export const TargetToolbar: React.FC<TargetToolbarProps> = ({
  targets,
  employees,
  onImport,
  onAdd
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
      let result: { targets: Target[]; errors: string[] };

      if (isExcel) {
        result = await importTargetsFromExcel(file, employees);
      } else {
        result = await importTargetsFromJSON(file);
      }

      onImport(result.targets, result.errors);
    } catch (err: any) {
      onImport([], [err.message]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex gap-1">
      <button
        onClick={() => exportTargetsToExcel(targets, employees)}
        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
        title="Xuất Excel"
      >
        <Download size={12} /> Excel
      </button>
      <button
        onClick={() => exportTargetsToJSON(targets)}
        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        title="Xuất JSON (backup)"
      >
        <Download size={12} /> JSON
      </button>
      <button
        onClick={downloadTargetTemplate}
        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        title="Tải mẫu Excel"
      >
        <FileSpreadsheet size={12} /> Mẫu
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
        title="Nhập từ Excel hoặc JSON"
      >
        <Upload size={12} /> Nhập
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.xlsx,.xls"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  );
};
