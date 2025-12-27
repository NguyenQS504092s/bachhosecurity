/**
 * Employees Context
 * Manages employee data and CRUD operations
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAllEmployees,
  createEmployee as createEmp,
  updateEmployee as updateEmp,
  deleteEmployee as deleteEmp
} from '../../services/realtime-database-service';
import type { Employee } from '../../types';

interface EmployeesContextType {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  addEmployee: (data: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  refreshEmployees: () => Promise<void>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const EmployeesContext = createContext<EmployeesContextType | null>(null);

export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (!context) throw new Error('useEmployees must be used within EmployeesProvider');
  return context;
};

export const EmployeesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllEmployees();
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error('[EmployeesContext] Failed to load:', err);
      setError('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEmployees();
  }, [refreshEmployees]);

  const addEmployee = useCallback(async (data: Partial<Employee>): Promise<Employee> => {
    const newEmp = await createEmp(data);
    setEmployees(prev => [...prev, newEmp]);
    return newEmp;
  }, []);

  const updateEmployee = useCallback(async (id: string, data: Partial<Employee>) => {
    await updateEmp(id, data);
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, []);

  const removeEmployee = useCallback(async (id: string) => {
    await deleteEmp(id);
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <EmployeesContext.Provider value={{
      employees,
      isLoading,
      error,
      addEmployee,
      updateEmployee,
      removeEmployee,
      refreshEmployees,
      setEmployees
    }}>
      {children}
    </EmployeesContext.Provider>
  );
};
