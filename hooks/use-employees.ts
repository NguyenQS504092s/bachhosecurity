/**
 * Employees hook
 * Manages employee CRUD operations and grid data
 */

import { useState, useCallback } from 'react'
import type { Employee } from '../types'

interface EmployeesState {
  allEmployees: Employee[]
  gridData: Employee[]
}

export function useEmployees(initialEmployees: Employee[], initialGridData: Employee[]) {
  const [state, setState] = useState<EmployeesState>({
    allEmployees: initialEmployees,
    gridData: initialGridData
  })

  const updateEmployee = useCallback((updatedEmp: Employee) => {
    setState(prev => ({
      allEmployees: prev.allEmployees.map(e => e.id === updatedEmp.id ? updatedEmp : e),
      gridData: prev.gridData.map(e => e.id === updatedEmp.id ? updatedEmp : e)
    }))
  }, [])

  const deleteEmployee = useCallback((empId: string) => {
    setState(prev => ({
      allEmployees: prev.allEmployees.filter(e => e.id !== empId),
      gridData: prev.gridData.filter(e => e.id !== empId)
    }))
  }, [])

  const addEmployee = useCallback((newEmp: Employee) => {
    setState(prev => ({
      allEmployees: [...prev.allEmployees, newEmp],
      gridData: [...prev.gridData, { ...newEmp, attendance: {} }]
    }))
  }, [])

  const setAllEmployees = useCallback((employees: Employee[]) => {
    setState(prev => ({
      ...prev,
      allEmployees: employees,
      gridData: employees
    }))
  }, [])

  const setGridData = useCallback((data: Employee[]) => {
    setState(prev => ({
      ...prev,
      gridData: data
    }))
  }, [])

  const mergeExtractedData = useCallback((extractedEmployees: Employee[]) => {
    setState(prev => {
      const updatedGridData = [...prev.gridData]
      const updatedAllEmployees = [...prev.allEmployees]

      extractedEmployees.forEach(extracted => {
        const existingInGrid = updatedGridData.findIndex(e => e.code === extracted.code)
        if (existingInGrid >= 0) {
          updatedGridData[existingInGrid] = {
            ...updatedGridData[existingInGrid],
            attendance: { ...updatedGridData[existingInGrid].attendance, ...extracted.attendance }
          }
        } else {
          updatedGridData.push(extracted)
        }

        const existingInMaster = updatedAllEmployees.findIndex(e => e.code === extracted.code)
        if (existingInMaster >= 0) {
          updatedAllEmployees[existingInMaster] = {
            ...updatedAllEmployees[existingInMaster],
            ...extracted
          }
        } else {
          updatedAllEmployees.push(extracted)
        }
      })

      return {
        allEmployees: updatedAllEmployees,
        gridData: updatedGridData
      }
    })
  }, [])

  return {
    ...state,
    updateEmployee,
    deleteEmployee,
    addEmployee,
    setAllEmployees,
    setGridData,
    mergeExtractedData
  }
}

export type UseEmployees = ReturnType<typeof useEmployees>
