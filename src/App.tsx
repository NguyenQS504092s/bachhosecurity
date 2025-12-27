/**
 * App.tsx - Main Application Entry
 * Orchestrates features and handles cross-feature interactions
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppProviders, AppLayout } from './core';
import { useAuth } from './features/auth';
import { useEmployees } from './features/hr';
import { useTargets } from './features/targets';
import { useTimesheet } from './features/timesheet';
import { TimesheetGrid } from './components/timesheet';
import { HRManagement } from './components/hr';
import { TargetManagement } from './features/targets';
import { ImageCapture, SyncButton, BackupButton } from './components/shared';
import { Employee, Target } from './types';
import { FileDown, FileUp, AlertCircle, Camera, DollarSign, FileSpreadsheet } from 'lucide-react';
import { exportToExcel, importTimesheetFromExcel, exportPayrollToExcel, downloadTimesheetTemplate } from './utils/excel-export';
import { getAllEmployees, getAllTargets } from './services/realtime-database-service';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { employees, addEmployee, updateEmployee, removeEmployee, refreshEmployees } = useEmployees();
  const { targets, addTarget, updateTarget, removeTarget, refreshTargets, setTargets } = useTargets();
  const { gridData, year, month, setYear, setMonth, setGridData, saveTimesheet, refreshTimesheet } = useTimesheet();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showImageCapture, setShowImageCapture] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Load Gemini API key
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) (window as any).__GEMINI_API_KEY__ = savedKey;
  }, []);

  // Sync complete handler
  const handleSyncComplete = useCallback(async () => {
    await Promise.all([refreshEmployees(), refreshTargets()]);
  }, [refreshEmployees, refreshTargets]);

  // Image data extraction handler
  const handleImageDataExtracted = useCallback(async (extractedEmployees: Employee[]) => {
    for (const emp of extractedEmployees) {
      const existing = employees.find(e => e.code === emp.code);
      if (existing) {
        // Update attendance
        setGridData(prev => prev.map(e =>
          e.id === existing.id ? { ...e, attendance: { ...e.attendance, ...emp.attendance } } : e
        ));
      } else {
        // Add new employee
        const newEmp = await addEmployee(emp);
        // Auto-create target if needed
        if (emp.department && emp.department !== 'Chưa xác định') {
          const existingTarget = targets.find(t => t.name === emp.department);
          if (!existingTarget) {
            await addTarget({ name: emp.department, roster: [{ employeeId: newEmp.id, shift: emp.shift || '08:00 - 17:00' }] });
          }
        }
      }
    }
    await saveTimesheet();
  }, [employees, targets, addEmployee, addTarget, setGridData, saveTimesheet]);

  // Grid change handler
  const handleGridChange = useCallback(async (newData: Employee[]) => {
    setGridData(newData);
    // Auto-save with debounce handled by context
    await saveTimesheet();
  }, [setGridData, saveTimesheet]);

  // Import Excel handler
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);

    try {
      const { employees: imported, errors } = await importTimesheetFromExcel(file, employees);
      if (errors.length > 0) setErrorMsg(`Cảnh báo: ${errors.join(', ')}`);

      for (const emp of imported) {
        const existing = gridData.find(e => e.code === emp.code);
        if (existing) {
          setGridData(prev => prev.map(e =>
            e.code === emp.code ? { ...e, attendance: { ...e.attendance, ...emp.attendance } } : e
          ));
        } else {
          await addEmployee(emp);
        }
      }
      await saveTimesheet();
      alert(`Đã nhập thành công ${imported.length} nhân viên từ file Excel!`);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    if (importFileRef.current) importFileRef.current.value = '';
  };

  // Month/Year selector for header
  const headerControls = (
    <div className="hidden lg:flex items-center space-x-2 mr-4">
      <select
        value={month}
        onChange={(e) => setMonth(parseInt(e.target.value))}
        className="bg-blue-900 text-white border border-blue-600 rounded px-2 py-1 text-sm outline-none shadow-sm cursor-pointer hover:bg-blue-800 transition"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <option key={i} value={i}>Tháng {i + 1}</option>
        ))}
      </select>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value))}
        className="bg-blue-900 text-white border border-blue-600 rounded px-2 py-1 w-20 text-sm outline-none shadow-sm hover:bg-blue-800 transition"
      />
    </div>
  );

  return (
    <AppLayout headerControls={headerControls}>
      {({ currentView }) => (
        <>
          {currentView === 'timesheet' && (
            <>
              {/* Actions Bar */}
              <div className="flex justify-end mb-4 space-x-2">
                <SyncButton onSyncComplete={handleSyncComplete} />
                <BackupButton />
                <button onClick={() => setShowImageCapture(true)} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded shadow transition text-sm font-medium text-white">
                  <Camera size={16} /><span>Chụp Ảnh & Nhập Dữ Liệu</span>
                </button>
                <button onClick={() => downloadTimesheetTemplate(year, month)} className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded shadow transition text-sm font-medium text-white" title="Tải mẫu Excel">
                  <FileSpreadsheet size={16} /><span>Tải Mẫu</span>
                </button>
                <button onClick={() => importFileRef.current?.click()} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded shadow transition text-sm font-medium text-white">
                  <FileUp size={16} /><span>Nhập Excel</span>
                </button>
                <button onClick={() => exportToExcel(gridData, year, month)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded shadow transition text-sm font-medium text-white">
                  <FileDown size={16} /><span>Xuất Excel</span>
                </button>
                <button onClick={() => exportPayrollToExcel(gridData, year, month)} className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded shadow transition text-sm font-medium text-white" title="Xuất bảng lương">
                  <DollarSign size={16} /><span>Xuất Lương</span>
                </button>
                <input ref={importFileRef} type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
              </div>

              {errorMsg && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded">
                  <div className="flex items-center mb-2"><AlertCircle size={18} className="mr-2" /><span className="font-semibold">Lỗi xử lý</span></div>
                  <div className="text-sm">{errorMsg}</div>
                </div>
              )}

              <TimesheetGrid
                year={year}
                month={month}
                data={gridData}
                targets={targets}
                allEmployees={employees}
                onDataChange={handleGridChange}
              />

              <ImageCapture
                isOpen={showImageCapture}
                onClose={() => setShowImageCapture(false)}
                onDataExtracted={handleImageDataExtracted}
                existingEmployees={employees}
              />
            </>
          )}

          {currentView === 'targets' && (
            <TargetManagement
              targets={targets}
              employees={employees}
              onUpdateTargets={setTargets}
            />
          )}

          {currentView === 'hr' && (
            <HRManagement
              employees={employees}
              gridData={gridData}
              year={year}
              month={month}
              currentUser={currentUser}
              onUpdateEmployee={(emp) => updateEmployee(emp.id, emp)}
              onDeleteEmployee={removeEmployee}
              onAddEmployee={addEmployee}
            />
          )}
        </>
      )}
    </AppLayout>
  );
};

const App: React.FC = () => (
  <AppProviders>
    <AppContent />
  </AppProviders>
);

export default App;
