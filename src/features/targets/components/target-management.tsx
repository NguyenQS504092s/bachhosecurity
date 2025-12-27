/**
 * Target Management Component
 * Main view for managing targets
 */

import React, { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Target, Employee } from '../../../types';
import { TargetToolbar } from './target-toolbar';
import { ShiftManager } from './shift-manager';
import { TargetListItem } from './target-list-item';
import { TargetForm } from './target-form';

interface TargetManagementProps {
  targets: Target[];
  employees: Employee[];
  onUpdateTargets: (newTargets: Target[]) => void;
}

export const TargetManagement: React.FC<TargetManagementProps> = ({
  targets,
  employees,
  onUpdateTargets
}) => {
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showShiftManager, setShowShiftManager] = useState(false);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTarget(null);
  };

  const handleEdit = (target: Target) => {
    setIsCreating(false);
    setEditingTarget(target);
  };

  const handleSave = (data: { name: string; roster: any[] }) => {
    const newTarget: Target = {
      id: editingTarget ? editingTarget.id : Math.random().toString(36).substr(2, 9),
      name: data.name,
      roster: data.roster
    };

    let updated: Target[];
    if (editingTarget) {
      updated = targets.map(t => t.id === editingTarget.id ? newTarget : t);
    } else {
      updated = [...targets, newTarget];
    }

    onUpdateTargets(updated);
    handleCancel();
  };

  const handleCancel = () => {
    setEditingTarget(null);
    setIsCreating(false);
  };

  const handleDelete = (id?: string) => {
    const targetId = id || editingTarget?.id;
    if (!targetId) return;

    if (confirm('Bạn có chắc chắn muốn xóa mục tiêu này không?')) {
      onUpdateTargets(targets.filter(t => t.id !== targetId));
      if (editingTarget?.id === targetId) handleCancel();
    }
  };

  const handleImport = (imported: Target[], errors: string[]) => {
    if (errors.length > 0) {
      setImportError(errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n...và ${errors.length - 5} lỗi khác` : ''));
    } else {
      setImportError(null);
    }

    if (imported.length > 0) {
      const merged = [...targets];
      imported.forEach(t => {
        const idx = merged.findIndex(m => m.name === t.name);
        if (idx >= 0) merged[idx] = t;
        else merged.push(t);
      });
      onUpdateTargets(merged);
      alert(`Đã nhập thành công ${imported.length} mục tiêu!`);
    } else if (errors.length === 0) {
      setImportError('Không tìm thấy mục tiêu nào trong file.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex">
      {/* Left Sidebar */}
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

          <TargetToolbar
            targets={targets}
            employees={employees}
            onImport={handleImport}
            onAdd={handleCreate}
          />

          <ShiftManager isOpen={showShiftManager} onToggle={() => setShowShiftManager(!showShiftManager)} />

          {importError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 whitespace-pre-line">
              {importError}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {targets.map(target => (
            <TargetListItem
              key={target.id}
              target={target}
              isSelected={editingTarget?.id === target.id}
              onSelect={() => handleEdit(target)}
              onDelete={() => handleDelete(target.id)}
            />
          ))}
          {targets.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">Chưa có mục tiêu nào.</div>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-2/3 flex flex-col">
        {(editingTarget || isCreating) ? (
          <TargetForm
            target={editingTarget}
            isCreating={isCreating}
            employees={employees}
            onSave={handleSave}
            onDelete={() => handleDelete()}
            onCancel={handleCancel}
          />
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
