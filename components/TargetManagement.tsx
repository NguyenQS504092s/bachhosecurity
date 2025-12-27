import React, { useState, useRef, useEffect } from 'react';
import { Employee, Target, RosterItem } from '../types';
import { MapPin, Users, Plus, Trash2, Save, X, Download, Upload, Clock, Edit2, FileSpreadsheet } from 'lucide-react';
import { exportTargetsToExcel, exportTargetsToJSON, importTargetsFromJSON, importTargetsFromExcel, downloadTargetTemplate } from '../utils/excel-export';
import { DEFAULT_SHIFTS, getCustomShifts, saveCustomShifts as saveShiftsToFirebase } from '../services/firebase';

interface TargetManagementProps {
  targets: Target[];
  employees: Employee[];
  onUpdateTargets: (newTargets: Target[]) => void;
}

export const TargetManagement: React.FC<TargetManagementProps> = ({ targets, employees, onUpdateTargets }) => {
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRoster, setFormRoster] = useState<RosterItem[]>([]);

  // Custom shift management
  const [customShifts, setCustomShifts] = useState<string[]>([]);
  const [showShiftManager, setShowShiftManager] = useState(false);
  const [newShiftStart, setNewShiftStart] = useState('08:00');
  const [newShiftEnd, setNewShiftEnd] = useState('17:00');
  const [isLoadingShifts, setIsLoadingShifts] = useState(true);

  // Combined shift options (default + custom)
  const shiftOptions = [...DEFAULT_SHIFTS, ...customShifts];

  // Load custom shifts from Firebase
  useEffect(() => {
    const loadShifts = async () => {
      try {
        const shifts = await getCustomShifts();
        setCustomShifts(shifts);
      } catch (error) {
        console.error('[TargetManagement] Failed to load shifts:', error);
      } finally {
        setIsLoadingShifts(false);
      }
    };
    loadShifts();
  }, []);

  // Save custom shifts to Firebase
  const saveCustomShifts = async (shifts: string[]) => {
    setCustomShifts(shifts);
    try {
      await saveShiftsToFirebase(shifts);
      console.log('[TargetManagement] Shifts saved to Firebase');
    } catch (error) {
      console.error('[TargetManagement] Failed to save shifts:', error);
    }
  };

  // Add new custom shift (24h format)
  const handleAddCustomShift = () => {
    const newShift = `${newShiftStart} - ${newShiftEnd}`;
    if (!shiftOptions.includes(newShift)) {
      saveCustomShifts([...customShifts, newShift]);
      setNewShiftStart('08:00');
      setNewShiftEnd('17:00');
    }
  };

  // Remove custom shift
  const handleRemoveCustomShift = (shift: string) => {
    saveCustomShifts(customShifts.filter(s => s !== shift));
  };

  // Edit state for shifts
  const [editingShiftIndex, setEditingShiftIndex] = useState<number | null>(null);
  const [editShiftStart, setEditShiftStart] = useState('');
  const [editShiftEnd, setEditShiftEnd] = useState('');

  // Start editing a shift (24h format: "08:00 - 17:00")
  const startEditShift = (shift: string, index: number) => {
    const parts = shift.split(' - ');
    if (parts.length === 2) {
      setEditShiftStart(parts[0]);
      setEditShiftEnd(parts[1]);
      setEditingShiftIndex(index);
    }
  };

  // Save edited shift (24h format)
  const saveEditedShift = (originalShift: string) => {
    const newShift = `${editShiftStart} - ${editShiftEnd}`;
    if (newShift === originalShift) {
      setEditingShiftIndex(null);
      return;
    }

    // Check if new shift already exists
    if (shiftOptions.includes(newShift)) {
      alert('Ca này đã tồn tại!');
      return;
    }

    const isCustom = customShifts.includes(originalShift);
    if (isCustom) {
      // Update custom shift
      saveCustomShifts(customShifts.map(s => s === originalShift ? newShift : s));
    } else {
      // "Edit" default shift = add new custom shift
      saveCustomShifts([...customShifts, newShift]);
    }
    setEditingShiftIndex(null);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTarget(null);
    setFormName('Mục Tiêu Mới');
    setFormRoster([]);
  };

  const handleEdit = (target: Target) => {
    setIsCreating(false);
    setEditingTarget(target);
    setFormName(target.name);
    setFormRoster([...target.roster]);
  };

  const handleSave = () => {
    if (!formName.trim()) return;

    const newTargetData: Target = {
      id: editingTarget ? editingTarget.id : Math.random().toString(36).substr(2, 9),
      name: formName,
      roster: formRoster
    };

    let updatedTargets;
    if (editingTarget) {
      updatedTargets = targets.map(t => t.id === editingTarget.id ? newTargetData : t);
    } else {
      updatedTargets = [...targets, newTargetData];
    }

    onUpdateTargets(updatedTargets);
    handleCancel();
  };

  const handleCancel = () => {
    setEditingTarget(null);
    setIsCreating(false);
    setFormName('');
    setFormRoster([]);
  };

  const handleDeleteTarget = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục tiêu này không?')) {
      onUpdateTargets(targets.filter(t => t.id !== id));
      if (editingTarget?.id === id) handleCancel();
    }
  };

  // Roster Management
  const addEmployeeToRoster = () => {
    setFormRoster([...formRoster, { employeeId: '', shift: '' }]);
  };

  const removeRosterItem = (index: number) => {
    setFormRoster(formRoster.filter((_, i) => i !== index));
  };

  const updateRosterItem = (index: number, field: keyof RosterItem, value: string) => {
    const newRoster = [...formRoster];
    newRoster[index] = { ...newRoster[index], [field]: value };
    setFormRoster(newRoster);
  };

  // Import/Export handlers
  const handleExportExcel = () => {
    exportTargetsToExcel(targets, employees);
  };

  const handleExportJSON = () => {
    exportTargetsToJSON(targets);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      let importedTargets: Target[] = [];
      let errors: string[] = [];

      // Detect file type and use appropriate import function
      const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');

      if (isExcel) {
        const result = await importTargetsFromExcel(file, employees);
        importedTargets = result.targets;
        errors = result.errors;
      } else {
        const result = await importTargetsFromJSON(file);
        importedTargets = result.targets;
        errors = result.errors;
      }

      if (errors.length > 0) {
        setImportError(errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n...và ${errors.length - 5} lỗi khác` : ''));
      }

      if (importedTargets.length > 0) {
        // Merge with existing targets (replace by name or add new)
        const mergedTargets = [...targets];
        importedTargets.forEach(imported => {
          const existingIndex = mergedTargets.findIndex(t => t.name === imported.name);
          if (existingIndex >= 0) {
            mergedTargets[existingIndex] = imported;
          } else {
            mergedTargets.push(imported);
          }
        });
        onUpdateTargets(mergedTargets);
        alert(`Đã nhập thành công ${importedTargets.length} mục tiêu từ file ${isExcel ? 'Excel' : 'JSON'}!`);
      } else if (errors.length === 0) {
        setImportError('Không tìm thấy mục tiêu nào trong file.');
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex">
      {/* Left Sidebar: List of Targets */}
      <div className="w-1/3 border-r flex flex-col bg-gray-50">
        <div className="p-4 border-b bg-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-700 flex items-center">
              <MapPin size={18} className="mr-2 text-blue-600" /> Danh Sách Mục Tiêu
            </h3>
            <button
              onClick={handleCreate}
              className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              <Plus size={16} />
            </button>
          </div>
          {/* Import/Export buttons */}
          <div className="flex gap-1">
            <button
              onClick={handleExportExcel}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              title="Xuất Excel"
            >
              <Download size={12} /> Excel
            </button>
            <button
              onClick={handleExportJSON}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              title="Xuất JSON (backup)"
            >
              <Download size={12} /> JSON
            </button>
            <button
              onClick={downloadTargetTemplate}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              title="Tải mẫu Excel để nhập mục tiêu"
            >
              <FileSpreadsheet size={12} /> Mẫu
            </button>
            <button
              onClick={handleImportClick}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              title="Nhập từ Excel hoặc JSON"
            >
              <Upload size={12} /> Nhập
            </button>
          </div>
          {/* Shift Manager Button */}
          <button
            onClick={() => setShowShiftManager(!showShiftManager)}
            className="w-full mt-2 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            title="Quản lý khung giờ ca trực"
          >
            <Clock size={12} /> Quản Lý Ca Trực
          </button>
          {/* Shift Manager Panel */}
          {showShiftManager && (
            <div className="mt-2 p-3 bg-white border rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Clock size={14} className="mr-1" /> Khung Giờ Ca Trực
              </h4>
              {/* Add new shift */}
              <div className="flex gap-1 mb-2">
                <input
                  type="time"
                  value={newShiftStart}
                  onChange={(e) => setNewShiftStart(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border rounded"
                />
                <span className="text-gray-400 self-center">-</span>
                <input
                  type="time"
                  value={newShiftEnd}
                  onChange={(e) => setNewShiftEnd(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border rounded"
                />
                <button
                  onClick={handleAddCustomShift}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                  title="Thêm ca mới"
                >
                  <Plus size={12} />
                </button>
              </div>
              {/* List of shifts */}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {isLoadingShifts ? (
                  <div className="text-xs text-gray-400 text-center py-2">Đang tải...</div>
                ) : (
                  shiftOptions.map((shift, idx) => {
                    const isCustom = customShifts.includes(shift);
                    const isEditing = editingShiftIndex === idx;

                    return (
                      <div key={idx} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded">
                        {isEditing ? (
                          <>
                            <input
                              type="time"
                              value={editShiftStart}
                              onChange={(e) => setEditShiftStart(e.target.value)}
                              className="flex-1 px-1 py-0.5 border rounded text-xs"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                              type="time"
                              value={editShiftEnd}
                              onChange={(e) => setEditShiftEnd(e.target.value)}
                              className="flex-1 px-1 py-0.5 border rounded text-xs"
                            />
                            <button
                              onClick={() => saveEditedShift(shift)}
                              className="text-green-500 hover:text-green-700 p-0.5"
                              title="Lưu"
                            >
                              <Save size={12} />
                            </button>
                            <button
                              onClick={() => setEditingShiftIndex(null)}
                              className="text-gray-400 hover:text-gray-600 p-0.5"
                              title="Hủy"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className={`flex-1 ${isCustom ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                              {shift} {isCustom && '(tùy chỉnh)'}
                            </span>
                            <button
                              onClick={() => startEditShift(shift, idx)}
                              className="text-blue-400 hover:text-blue-600 p-0.5"
                              title="Sửa"
                            >
                              <Edit2 size={12} />
                            </button>
                            {isCustom && (
                              <button
                                onClick={() => handleRemoveCustomShift(shift)}
                                className="text-red-400 hover:text-red-600 p-0.5"
                                title="Xóa"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.xlsx,.xls"
            onChange={handleFileImport}
            className="hidden"
          />
          {importError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
              {importError}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {targets.map(target => (
            <div 
              key={target.id}
              className={`p-4 border-b hover:bg-blue-50 transition-colors flex items-center justify-between group ${editingTarget?.id === target.id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}`}
            >
              <div 
                onClick={() => handleEdit(target)}
                className="flex-1 cursor-pointer"
              >
                <div className="font-semibold text-gray-800">{target.name}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <Users size={12} className="mr-1" /> {target.roster.length} nhân sự
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTarget(target.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50 p-1.5 rounded ml-2"
                title="Xóa mục tiêu"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {targets.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">Chưa có mục tiêu nào.</div>
          )}
        </div>
      </div>

      {/* Right Content: Edit Form */}
      <div className="w-2/3 flex flex-col">
        {(editingTarget || isCreating) ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b bg-white" style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(0, 112, 192, 1)' }}>
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-800">
                    {isCreating ? 'Thêm Mục Tiêu Mới' : 'Chỉnh Sửa Mục Tiêu'}
                 </h2>
                 <button onClick={handleDeleteTarget} disabled={isCreating} className="text-red-500 hover:bg-red-50 p-2 rounded disabled:opacity-0">
                    <Trash2 size={18} />
                 </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Mục Tiêu / Địa Điểm</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: Mục tiêu Kho A"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
               <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-bold text-gray-700">Danh Sách Nhân Sự & Ca Trực</label>
                  <button 
                    onClick={addEmployeeToRoster}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center"
                  >
                    <Plus size={12} className="mr-1"/> Thêm Nhân Sự
                  </button>
               </div>
               
               <div className="space-y-2">
                 {formRoster.map((item, index) => (
                   <div key={index} className="flex gap-2 items-center bg-white p-2 rounded border shadow-sm">
                      <div className="flex-1">
                        <select 
                          value={item.employeeId}
                          onChange={(e) => updateRosterItem(index, 'employeeId', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                        >
                          <option value="">-- Chọn Nhân Sự --</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.code})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-48">
                         <input
                            type="text"
                            list={`shift-options-${index}`}
                            value={item.shift}
                            onChange={(e) => updateRosterItem(index, 'shift', e.target.value)}
                            placeholder="VD: 08h00 - 17h00"
                            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         />
                         <datalist id={`shift-options-${index}`}>
                           {shiftOptions.map((shift) => (
                             <option key={shift} value={shift} />
                           ))}
                         </datalist>
                      </div>
                      <button 
                        onClick={() => removeRosterItem(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                   </div>
                 ))}
                 {formRoster.length === 0 && (
                   <div className="text-sm text-gray-400 italic text-center py-4 border-2 border-dashed rounded">
                     Chưa có nhân sự nào trong mục tiêu này.
                   </div>
                 )}
               </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end space-x-2">
              <button onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                <Save size={16} className="mr-2" /> Lưu Thay Đổi
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MapPin size={48} className="mb-4 text-gray-300" />
            <p>Chọn một mục tiêu để chỉnh sửa hoặc tạo mới.</p>
          </div>
        )}
      </div>
    </div>
  );
};