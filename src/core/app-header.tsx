/**
 * App Header
 * Navigation bar with user info and controls
 */

import React from 'react';
import { LogOut, LayoutDashboard, Shield, MapPin, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../features/auth';

type ViewType = 'timesheet' | 'hr' | 'targets';

interface AppHeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSettingsClick: () => void;
  onLogout: () => void;
  children?: React.ReactNode; // For month/year selectors
}

const logoUrl = "https://www.appsheet.com/template/gettablefileurl?appName=Appsheet-325045268&tableName=Kho%20%E1%BA%A3nh&fileName=Kho%20%E1%BA%A3nh_Images%2Fa95c8148.%E1%BA%A2nh.072220.jpg";

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  onViewChange,
  onSettingsClick,
  onLogout,
  children
}) => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-blue-700 text-white shadow-md p-4 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo & User Info */}
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1 rounded-lg overflow-hidden h-12 w-12 flex items-center justify-center shadow-lg">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">Bạch Hổ Security</h1>
            <p className="text-blue-200 text-sm">
              Xin chào, {currentUser?.name} ({currentUser?.role === 'admin' ? 'Quản Trị' : 'Nhân Viên'})
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-2 bg-blue-800 p-1 rounded-lg shadow-inner">
          <button
            onClick={() => onViewChange('timesheet')}
            className={`flex items-center px-4 py-2 rounded transition font-medium ${
              currentView === 'timesheet' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-700 text-blue-200'
            }`}
          >
            <LayoutDashboard size={18} className="mr-2" /> Chấm Công
          </button>
          {currentUser?.role === 'admin' && (
            <>
              <button
                onClick={() => onViewChange('targets')}
                className={`flex items-center px-4 py-2 rounded transition font-medium ${
                  currentView === 'targets' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-700 text-blue-200'
                }`}
              >
                <MapPin size={18} className="mr-2" /> Mục Tiêu
              </button>
              <button
                onClick={() => onViewChange('hr')}
                className={`flex items-center px-4 py-2 rounded transition font-medium ${
                  currentView === 'hr' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-700 text-blue-200'
                }`}
              >
                <Shield size={18} className="mr-2" /> Nhân Sự
              </button>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {children}
          <button
            onClick={onSettingsClick}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded shadow transition text-sm font-medium"
            title="Cài đặt"
          >
            <SettingsIcon size={16} />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded shadow transition text-sm font-medium border border-red-500"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
