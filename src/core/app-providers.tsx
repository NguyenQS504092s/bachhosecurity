/**
 * App Providers
 * Composes all context providers in correct order
 */

import React from 'react';
import { AuthProvider } from '../features/auth';
import { EmployeesProvider } from '../features/hr';
import { TargetsProvider } from '../features/targets';
import { TimesheetProvider } from '../features/timesheet';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <AuthProvider>
    <EmployeesProvider>
      <TargetsProvider>
        <TimesheetProvider>
          {children}
        </TimesheetProvider>
      </TargetsProvider>
    </EmployeesProvider>
  </AuthProvider>
);
