/**
 * Targets hook
 * Manages target (work location) operations
 */

import { useState, useCallback } from 'react'
import type { Target } from '../types'

export function useTargets(initialTargets: Target[]) {
  const [targets, setTargets] = useState<Target[]>(initialTargets)

  const updateTargets = useCallback((newTargets: Target[]) => {
    setTargets(newTargets)
  }, [])

  const addTarget = useCallback((target: Target) => {
    setTargets(prev => [...prev, target])
  }, [])

  const removeTarget = useCallback((targetId: string) => {
    setTargets(prev => prev.filter(t => t.id !== targetId))
  }, [])

  const updateTarget = useCallback((updatedTarget: Target) => {
    setTargets(prev => prev.map(t => t.id === updatedTarget.id ? updatedTarget : t))
  }, [])

  return {
    targets,
    setTargets,
    updateTargets,
    addTarget,
    removeTarget,
    updateTarget
  }
}

export type UseTargets = ReturnType<typeof useTargets>
