/**
 * Hook for autocomplete functionality in employee fields
 * Provides suggestions for code and name fields
 */

import { useState, useCallback, useEffect } from 'react';
import type { Employee } from '../types';

interface AutocompleteState {
  activeField: string | null; // empId-field format
  suggestions: Employee[];
  searchTerm: string;
}

interface UseAutocompleteProps {
  allEmployees: Employee[];
  data: Employee[];
  onDataChange: (newData: Employee[]) => void;
}

export function useAutocomplete({ allEmployees, data, onDataChange }: UseAutocompleteProps) {
  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState>({
    activeField: null,
    suggestions: [],
    searchTerm: ''
  });

  // Track IME composition state (for Vietnamese/CJK input)
  const [isComposing, setIsComposing] = useState(false);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  // Get suggestions based on search term and field type
  const getSuggestions = useCallback((searchTerm: string, field: 'code' | 'name'): Employee[] => {
    if (!searchTerm || searchTerm.length < 1) return [];

    const term = searchTerm.toLowerCase().trim();
    return allEmployees.filter(emp => {
      if (field === 'code') {
        return emp.code?.toLowerCase().includes(term);
      } else {
        return emp.name?.toLowerCase().includes(term);
      }
    }).slice(0, 5); // Limit to 5 suggestions
  }, [allEmployees]);

  // Handle input change with autocomplete
  const handleAutocompleteInput = useCallback((
    empId: string,
    field: 'code' | 'name',
    value: string,
    handleInfoChange: (empId: string, field: keyof Employee, value: string) => void
  ) => {
    // Always update the value
    handleInfoChange(empId, field, value);

    // Skip autocomplete suggestions during IME composition (Vietnamese/CJK input)
    if (isComposing) {
      return;
    }

    const suggestions = getSuggestions(value, field);
    setAutocompleteState({
      activeField: `${empId}-${field}`,
      suggestions,
      searchTerm: value
    });
  }, [getSuggestions, isComposing]);

  // Select a suggestion and fill employee details
  const selectSuggestion = useCallback((empId: string, field: 'code' | 'name', emp: Employee) => {
    const updates: Partial<Employee> = {
      code: emp.code,
      name: emp.name,
      department: emp.department
    };

    const newData = data.map(e => {
      if (e.id === empId) {
        return { ...e, ...updates };
      }
      return e;
    });
    onDataChange(newData);

    setAutocompleteState({
      activeField: null,
      suggestions: [],
      searchTerm: ''
    });
  }, [data, onDataChange]);

  // Handle field focus
  const handleFieldFocus = useCallback((empId: string, field: 'code' | 'name', currentValue: string) => {
    const suggestions = getSuggestions(currentValue, field);
    setAutocompleteState({
      activeField: `${empId}-${field}`,
      suggestions,
      searchTerm: currentValue
    });
  }, [getSuggestions]);

  // Handle field blur (with delay for click handling)
  const handleFieldBlur = useCallback((empId: string, field: 'code' | 'name') => {
    const fieldKey = `${empId}-${field}`;
    setTimeout(() => {
      setAutocompleteState(prev =>
        prev.activeField === fieldKey ? { ...prev, activeField: null } : prev
      );
    }, 200);
  }, []);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.autocomplete-container')) {
        setAutocompleteState(prev => ({ ...prev, activeField: null }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if a specific field is active
  const isFieldActive = useCallback((empId: string, field: 'code' | 'name') => {
    return autocompleteState.activeField === `${empId}-${field}`;
  }, [autocompleteState.activeField]);

  return {
    autocompleteState,
    getSuggestions,
    handleAutocompleteInput,
    selectSuggestion,
    handleFieldFocus,
    handleFieldBlur,
    isFieldActive,
    // IME composition handlers for Vietnamese/CJK input
    handleCompositionStart,
    handleCompositionEnd,
  };
}
