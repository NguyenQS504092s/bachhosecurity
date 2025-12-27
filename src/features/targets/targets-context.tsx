/**
 * Targets Context
 * Manages targets data and CRUD operations
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAllTargets,
  createTarget as createTgt,
  updateTarget as updateTgt,
  deleteTarget as deleteTgt
} from '../../services/realtime-database-service';
import type { Target } from '../../types';

interface TargetsContextType {
  targets: Target[];
  isLoading: boolean;
  error: string | null;
  addTarget: (data: Partial<Target>) => Promise<Target>;
  updateTarget: (id: string, data: Partial<Target>) => Promise<void>;
  removeTarget: (id: string) => Promise<void>;
  refreshTargets: () => Promise<void>;
  setTargets: React.Dispatch<React.SetStateAction<Target[]>>;
}

const TargetsContext = createContext<TargetsContextType | null>(null);

export const useTargets = () => {
  const context = useContext(TargetsContext);
  if (!context) throw new Error('useTargets must be used within TargetsProvider');
  return context;
};

export const TargetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTargets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllTargets();
      setTargets(data);
      setError(null);
    } catch (err) {
      console.error('[TargetsContext] Failed to load:', err);
      setError('Không thể tải danh sách mục tiêu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTargets();
  }, [refreshTargets]);

  const addTarget = useCallback(async (data: Partial<Target>): Promise<Target> => {
    const newTarget = await createTgt(data);
    setTargets(prev => [...prev, newTarget]);
    return newTarget;
  }, []);

  const updateTarget = useCallback(async (id: string, data: Partial<Target>) => {
    await updateTgt(id, data);
    setTargets(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const removeTarget = useCallback(async (id: string) => {
    await deleteTgt(id);
    setTargets(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <TargetsContext.Provider value={{
      targets,
      isLoading,
      error,
      addTarget,
      updateTarget,
      removeTarget,
      refreshTargets,
      setTargets
    }}>
      {children}
    </TargetsContext.Provider>
  );
};
