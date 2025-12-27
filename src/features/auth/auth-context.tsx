/**
 * Auth Context
 * Manages authentication state (login/logout, current user)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Employee } from '../../types';

interface AuthContextType {
  currentUser: Employee | null;
  isLoggedIn: boolean;
  login: (user: Employee) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  const login = useCallback((user: Employee) => {
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn: !!currentUser,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
