/**
 * App Layout
 * Main application shell with header and content area
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppHeader } from './app-header';
import { useAuth } from '../features/auth';
import { Login } from '../components/auth';
import { Settings } from '../components/shared';

type ViewType = 'timesheet' | 'hr' | 'targets';

interface AppLayoutProps {
  children: (props: { currentView: ViewType }) => React.ReactNode;
  headerControls?: React.ReactNode;
  isLoading?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  headerControls,
  isLoading = false
}) => {
  const { currentUser, isLoggedIn, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('timesheet');
  const [showSettings, setShowSettings] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isLoggedIn) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      <AppHeader
        currentView={currentView}
        onViewChange={setCurrentView}
        onSettingsClick={() => setShowSettings(true)}
        onLogout={logout}
      >
        {headerControls}
      </AppHeader>

      <main className="flex-1 p-4 overflow-hidden flex flex-col max-w-[1920px] mx-auto w-full">
        {children({ currentView })}

        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <p>* Dữ liệu được lưu trữ tạm thời trên trình duyệt.</p>
          <p>Phiên bản 1.2.1 - Bạch Hổ Security</p>
        </div>
      </main>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
