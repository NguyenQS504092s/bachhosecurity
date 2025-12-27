/**
 * Target List Item Component
 * Single target row in the sidebar
 */

import React from 'react';
import { Users, Trash2 } from 'lucide-react';
import { Target } from '../../../types';

interface TargetListItemProps {
  target: Target;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const TargetListItem: React.FC<TargetListItemProps> = ({
  target,
  isSelected,
  onSelect,
  onDelete
}) => (
  <div
    className={`p-4 border-b hover:bg-blue-50 transition-colors flex items-center justify-between group ${
      isSelected ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
    }`}
  >
    <div onClick={onSelect} className="flex-1 cursor-pointer">
      <div className="font-semibold text-gray-800">{target.name}</div>
      <div className="text-xs text-gray-500 mt-1 flex items-center">
        <Users size={12} className="mr-1" /> {target.roster.length} nhân sự
      </div>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50 p-1.5 rounded ml-2"
      title="Xóa mục tiêu"
    >
      <Trash2 size={16} />
    </button>
  </div>
);
