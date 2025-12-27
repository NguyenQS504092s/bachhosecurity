import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimesheetGrid } from './components/TimesheetGrid';
import { Login } from './components/Login';
import { HRManagement } from './components/HRManagement';
import { TargetManagement } from './components/TargetManagement';
import { Settings } from './components/Settings';
import { ImageCapture } from './components/ImageCapture';
import { SyncButton } from './components/SyncStatus';
import { BackupButton } from './components/BackupButton';
import { Employee, Target } from './types';
import { FileDown, FileUp, AlertCircle, LogOut, LayoutDashboard, Shield, MapPin, Settings as SettingsIcon, Camera, DollarSign, Loader2, FileSpreadsheet } from 'lucide-react';
import { exportToExcel, importTimesheetFromExcel, exportPayrollToExcel, downloadTimesheetTemplate } from './utils/excel-export';
import {
  getAllEmployees,
  getAllTargets,
  getTimesheet,
  saveAllTimesheets,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateTarget,
  createTarget,
  deleteTarget
} from './services/realtime-database-service';

const App: React.FC = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentView, setCurrentView] = useState<'timesheet' | 'hr' | 'targets'>('timesheet');

  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(11); // Dec (0-indexed)

  // Loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);

  // Master Data (loaded from Firebase)
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  // Timesheet Data (The rows currently in the grid)
  const [gridData, setGridData] = useState<Employee[]>([]);

  const [targets, setTargets] = useState<Target[]>([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageCapture, setShowImageCapture] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Initialize Data - Load from Firebase on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [employees, fbTargets] = await Promise.all([
          getAllEmployees(),
          getAllTargets()
        ]);

        setAllEmployees(employees);
        setGridData(employees);
        setTargets(fbTargets);
        console.log('[App] Data loaded:', employees.length, 'employees,', fbTargets.length, 'targets');
      } catch (error) {
        console.error('[App] Failed to load initial data:', error);
        setErrorMsg('Không thể tải dữ liệu từ Firebase. Vui lòng kiểm tra kết nối.');
      } finally {
        setIsLoading(false);
      }
    };

    // Load API key from localStorage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      (window as any).__GEMINI_API_KEY__ = savedKey;
    }

    loadInitialData();
  }, []);

  // Load timesheet data when month/year changes
  useEffect(() => {
    const loadTimesheetByMonth = async () => {
      try {
        // Get timesheet data for the selected month from timesheets collection
        const timesheetData = await getTimesheet(year, month + 1); // month is 0-indexed in state

        // Merge timesheet attendance with employee data
        // IMPORTANT: Only use attendance from timesheets collection (month-specific)
        const employeesWithAttendance = allEmployees.map(emp => {
          const timesheet = timesheetData.find(t => t.employeeId === emp.id || t.id === emp.id);
          if (timesheet && timesheet.attendance) {
            return { ...emp, attendance: timesheet.attendance };
          }
          // No timesheet data for this employee in this month = empty attendance
          return { ...emp, attendance: {} };
        });
        setGridData(employeesWithAttendance);
        console.log(`[App] Loaded timesheet for ${month + 1}/${year}:`, timesheetData.length, 'records');
      } catch (error) {
        console.error('[App] Failed to load timesheet:', error);
      }
    };

    // Only load if we have employees and not in initial loading state
    if (allEmployees.length > 0 && !isLoading) {
      loadTimesheetByMonth();
    }
  }, [year, month, allEmployees, isLoading]);

  // Refresh data from Firebase after sync
  const handleSyncComplete = useCallback(async () => {
    try {
      const [employees, fbTargets] = await Promise.all([
        getAllEmployees(),
        getAllTargets()
      ]);

      if (employees.length > 0) {
        setAllEmployees(employees);
        setGridData(employees);
      }
      if (fbTargets.length > 0) {
        setTargets(fbTargets);
      }
      console.log('[App] Data refreshed from Firebase after sync');
    } catch (error) {
      console.error('[App] Failed to refresh after sync:', error);
    }
  }, []);

  const handleLogin = async (code: string, pass: string) => {
    // Authenticate against the MASTER list, not the grid data
    const user = allEmployees.find(e => e.code === code && e.password === pass);
    if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        // Default View
        setCurrentView('timesheet');
    } else {
        throw new Error("Mã nhân viên hoặc mật khẩu không đúng.");
    }
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
      setCurrentUser(null);
  };



  const handleImageDataExtracted = async (extractedEmployees: Employee[]) => {
    // Merge with existing data - update if exists, add if new
    const updatedGridData = [...gridData];
    const updatedAllEmployees = [...allEmployees];
    const newEmployeesForTargets: Employee[] = [];

    extractedEmployees.forEach(extracted => {
      // Check if employee exists in grid
      const existingInGrid = updatedGridData.findIndex(e => e.code === extracted.code);
      if (existingInGrid >= 0) {
        // Update existing employee in grid with new attendance data
        updatedGridData[existingInGrid] = {
          ...updatedGridData[existingInGrid],
          attendance: { ...updatedGridData[existingInGrid].attendance, ...extracted.attendance }
        };
      } else {
        // Add new employee to grid
        updatedGridData.push(extracted);
        newEmployeesForTargets.push(extracted);
      }

      // Check if employee exists in master list
      const existingInMaster = updatedAllEmployees.findIndex(e => e.code === extracted.code);
      if (existingInMaster >= 0) {
        // Update existing employee in master list
        updatedAllEmployees[existingInMaster] = {
          ...updatedAllEmployees[existingInMaster],
          ...extracted
        };
      } else {
        // Add new employee to master list
        updatedAllEmployees.push(extracted);
      }
    });

    setGridData(updatedGridData);
    setAllEmployees(updatedAllEmployees);

    // Auto-create targets for new employees if department doesn't exist
    if (newEmployeesForTargets.length > 0) {
      const newTargetsToCreate: Target[] = [];

      setTargets(prevTargets => {
        let updatedTargets = [...prevTargets];

        for (const emp of newEmployeesForTargets) {
          if (emp.department && emp.id && emp.department !== 'Chưa xác định') {
            let matchingTarget = updatedTargets.find(t => t.name === emp.department);

            if (!matchingTarget) {
              const newTarget: Target = {
                id: Math.random().toString(36).substr(2, 9),
                name: emp.department,
                roster: [{ employeeId: emp.id, shift: emp.shift || '08:00 - 17:00' }]
              };
              updatedTargets.push(newTarget);
              newTargetsToCreate.push(newTarget);
              console.log(`[App] Auto-created target from image: ${emp.department}`);
            } else if (!matchingTarget.roster.some(r => r.employeeId === emp.id)) {
              updatedTargets = updatedTargets.map(t => {
                if (t.id === matchingTarget!.id) {
                  return { ...t, roster: [...t.roster, { employeeId: emp.id, shift: emp.shift || '08:00 - 17:00' }] };
                }
                return t;
              });
            }
          }
        }

        return updatedTargets;
      });

      // Persist new targets to Firebase
      for (const newTarget of newTargetsToCreate) {
        try {
          await createTarget({ name: newTarget.name, roster: newTarget.roster });
        } catch (error) {
          console.error('[App] Failed to create target:', error);
        }
      }
    }
  };

  const handleUpdateEmployee = async (updatedEmp: Employee) => {
      // Update master list
      setAllEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
      // Update grid data if they are present there
      setGridData(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));

      // Persist to Firebase
      try {
        await updateEmployee(updatedEmp.id, updatedEmp);
        console.log('[App] Employee updated in Firebase:', updatedEmp.name);
      } catch (error) {
        console.error('[App] Failed to update employee in Firebase:', error);
      }
  };

  const handleDeleteEmployee = async (empId: string) => {
      // Remove from master list
      setAllEmployees(prev => prev.filter(e => e.id !== empId));
      // Remove from grid data
      setGridData(prev => prev.filter(e => e.id !== empId));

      // Remove from all targets roster
      setTargets(prev => prev.map(target => ({
        ...target,
        roster: target.roster.filter(r => r.employeeId !== empId)
      })));

      // Persist to Firebase
      try {
        await deleteEmployee(empId);
        // Also update targets in Firebase
        for (const target of targets) {
          if (target.roster.some(r => r.employeeId === empId)) {
            await updateTarget(target.id, {
              ...target,
              roster: target.roster.filter(r => r.employeeId !== empId)
            });
          }
        }
        console.log('[App] Employee deleted from Firebase:', empId);
      } catch (error) {
        console.error('[App] Failed to delete employee from Firebase:', error);
      }
  };

  const handleAddEmployee = async (newEmp: Employee) => {
      // Add to master list
      setAllEmployees(prev => [...prev, newEmp]);
      // Optionally add to grid data with empty attendance
      setGridData(prev => [...prev, { ...newEmp, attendance: {} }]);

      // Persist to Firebase
      try {
        await createEmployee({
          code: newEmp.code,
          name: newEmp.name,
          department: newEmp.department,
          shift: newEmp.shift || '08:00 - 17:00',
          attendance: {}, // Empty - attendance stored in timesheets/{year}/{month}
          password: newEmp.password || '123',
          role: newEmp.role || 'staff',
          dailyRate: newEmp.dailyRate,
          bonus: newEmp.bonus,
          penalty: newEmp.penalty
        });
        console.log('[App] Employee created in Firebase:', newEmp.name);
      } catch (error) {
        console.error('[App] Failed to create employee in Firebase:', error);
      }

      // Auto-create target if department doesn't exist
      if (newEmp.department && newEmp.id && newEmp.department !== 'Chưa xác định') {
        const existingTarget = targets.find(t => t.name === newEmp.department);

        if (!existingTarget) {
          const newTarget: Target = {
            id: Math.random().toString(36).substr(2, 9),
            name: newEmp.department,
            roster: [{ employeeId: newEmp.id, shift: newEmp.shift || '08:00 - 17:00' }]
          };

          setTargets(prev => [...prev, newTarget]);

          try {
            await createTarget({ name: newTarget.name, roster: newTarget.roster });
            console.log('[App] Auto-created target:', newTarget.name);
          } catch (error) {
            console.error('[App] Failed to create target:', error);
          }
        } else if (!existingTarget.roster.some(r => r.employeeId === newEmp.id)) {
          // Add to existing target
          const updatedTarget = {
            ...existingTarget,
            roster: [...existingTarget.roster, { employeeId: newEmp.id, shift: newEmp.shift || '08:00 - 17:00' }]
          };

          setTargets(prev => prev.map(t => t.id === existingTarget.id ? updatedTarget : t));

          try {
            await updateTarget(existingTarget.id, updatedTarget);
          } catch (error) {
            console.error('[App] Failed to update target:', error);
          }
        }
      }
  };

  const handleUpdateTargets = async (newTargets: Target[]) => {
      const oldTargets = targets;
      setTargets(newTargets);

      // Sync roster changes with employee departments
      const employeeUpdates: { empId: string; newDept: string }[] = [];

      for (const newTarget of newTargets) {
        const oldTarget = oldTargets.find(t => t.id === newTarget.id);

        // Find newly added employees to this target's roster
        for (const rosterItem of newTarget.roster) {
          const wasInOldRoster = oldTarget?.roster.some(r => r.employeeId === rosterItem.employeeId);
          if (!wasInOldRoster) {
            employeeUpdates.push({ empId: rosterItem.employeeId, newDept: newTarget.name });
          }
        }

        // Find removed employees from this target's roster
        if (oldTarget) {
          for (const oldRosterItem of oldTarget.roster) {
            const stillInRoster = newTarget.roster.some(r => r.employeeId === oldRosterItem.employeeId);
            if (!stillInRoster) {
              // Check if moved to another target
              const movedToOther = newTargets.some(t =>
                t.id !== newTarget.id && t.roster.some(r => r.employeeId === oldRosterItem.employeeId)
              );
              if (!movedToOther) {
                employeeUpdates.push({ empId: oldRosterItem.employeeId, newDept: 'Chưa xác định' });
              }
            }
          }
        }
      }

      // Apply employee department updates
      if (employeeUpdates.length > 0) {
        setAllEmployees(prev => prev.map(emp => {
          const update = employeeUpdates.find(u => u.empId === emp.id);
          if (update) {
            return { ...emp, department: update.newDept };
          }
          return emp;
        }));

        setGridData(prev => prev.map(emp => {
          const update = employeeUpdates.find(u => u.empId === emp.id);
          if (update) {
            return { ...emp, department: update.newDept };
          }
          return emp;
        }));

        // Persist to Firebase
        for (const update of employeeUpdates) {
          try {
            await updateEmployee(update.empId, { department: update.newDept });
          } catch (error) {
            console.error('[App] Failed to sync employee department:', error);
          }
        }
        console.log('[App] Synced roster changes with employee departments');
      }

      // Persist target changes to Firebase
      try {
        const oldIds = new Set(oldTargets.map(t => t.id));
        const newIds = new Set(newTargets.map(t => t.id));

        // Create new targets
        for (const target of newTargets) {
          if (!oldIds.has(target.id)) {
            await createTarget({ name: target.name, roster: target.roster });
            console.log('[App] Target created in Firebase:', target.name);
          }
        }

        // Update existing targets
        for (const target of newTargets) {
          if (oldIds.has(target.id)) {
            const oldTarget = oldTargets.find(t => t.id === target.id);
            if (oldTarget && JSON.stringify(oldTarget) !== JSON.stringify(target)) {
              await updateTarget(target.id, target);
              console.log('[App] Target updated in Firebase:', target.name);
            }
          }
        }

        // Delete removed targets
        for (const target of oldTargets) {
          if (!newIds.has(target.id)) {
            await deleteTarget(target.id);
            console.log('[App] Target deleted from Firebase:', target.name);
          }
        }
      } catch (error) {
        console.error('[App] Failed to update targets in Firebase:', error);
      }
  };

  // Debounce timer for saving attendance
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleGridChange = async (newData: Employee[]) => {
      setGridData(newData);

      // Build map of existing employees by id
      const existingMap = new Map(allEmployees.map(e => [e.id, e]));
      const newEmployees: Employee[] = [];
      const changedEmployees: Employee[] = [];

      // Detect new and changed employees
      for (const emp of newData) {
        const existing = existingMap.get(emp.id);
        if (!existing) {
          // New employee
          newEmployees.push(emp);
        } else {
          // Check if info changed (code, name, department)
          if (existing.code !== emp.code || existing.name !== emp.name || existing.department !== emp.department) {
            changedEmployees.push(emp);
          }
        }
      }

      // Sync new employees to allEmployees
      if (newEmployees.length > 0) {
        setAllEmployees(prev => [...prev, ...newEmployees]);

        // Save new employees to Firebase (without attendance - attendance is per-month in timesheets)
        for (const emp of newEmployees) {
          try {
            if (emp.code && emp.name) {
              await createEmployee({
                code: emp.code,
                name: emp.name,
                department: emp.department || 'Chưa xác định',
                shift: emp.shift || '08:00 - 17:00',
                attendance: {}, // Empty - attendance stored in timesheets/{year}/{month}
                password: '123',
                role: 'staff'
              });
              console.log('[App] Saved new employee to Firebase:', emp.name);
            }
          } catch (error) {
            console.error('[App] Failed to save employee:', error);
          }
        }
      }

      // Sync changed employees to allEmployees and Firebase
      if (changedEmployees.length > 0) {
        setAllEmployees(prev => prev.map(e => {
          const changed = changedEmployees.find(c => c.id === e.id);
          if (changed) {
            return { ...e, code: changed.code, name: changed.name, department: changed.department };
          }
          return e;
        }));

        // Persist info changes to Firebase
        for (const emp of changedEmployees) {
          try {
            await updateEmployee(emp.id, {
              code: emp.code,
              name: emp.name,
              department: emp.department
            });
            console.log('[App] Synced employee info to Firebase:', emp.name);
          } catch (error) {
            console.error('[App] Failed to sync employee info:', error);
          }
        }

        // Sync department changes with Targets
        const deptChanges = changedEmployees.filter(emp => {
          const existing = existingMap.get(emp.id);
          return existing && existing.department !== emp.department;
        });

        if (deptChanges.length > 0) {
          setTargets(prevTargets => {
            let updatedTargets = [...prevTargets];

            for (const emp of deptChanges) {
              const oldDept = existingMap.get(emp.id)?.department;
              const newDept = emp.department;

              // Remove from old target roster
              if (oldDept) {
                updatedTargets = updatedTargets.map(t => {
                  if (t.name === oldDept) {
                    return { ...t, roster: t.roster.filter(r => r.employeeId !== emp.id) };
                  }
                  return t;
                });
              }

              // Add to new target roster
              const newTarget = updatedTargets.find(t => t.name === newDept);
              if (newTarget && !newTarget.roster.some(r => r.employeeId === emp.id)) {
                updatedTargets = updatedTargets.map(t => {
                  if (t.id === newTarget.id) {
                    return { ...t, roster: [...t.roster, { employeeId: emp.id, shift: '08:00 - 17:00' }] };
                  }
                  return t;
                });
              }
            }

            return updatedTargets;
          });
          console.log('[App] Synced department changes with Targets');
        }
      }

      // Sync new employees with matching Targets (auto-create if not exist)
      if (newEmployees.length > 0) {
        const newTargetsToCreate: Target[] = [];

        setTargets(prevTargets => {
          let updatedTargets = [...prevTargets];

          for (const emp of newEmployees) {
            if (emp.department && emp.id && emp.department !== 'Chưa xác định') {
              let matchingTarget = updatedTargets.find(t => t.name === emp.department);

              // Auto-create target if not exist
              if (!matchingTarget) {
                const newTarget: Target = {
                  id: Math.random().toString(36).substr(2, 9),
                  name: emp.department,
                  roster: [{ employeeId: emp.id, shift: emp.shift || '08:00 - 17:00' }]
                };
                updatedTargets.push(newTarget);
                newTargetsToCreate.push(newTarget);
                console.log(`[App] Auto-created target: ${emp.department}`);
              } else if (!matchingTarget.roster.some(r => r.employeeId === emp.id)) {
                // Add to existing target
                updatedTargets = updatedTargets.map(t => {
                  if (t.id === matchingTarget!.id) {
                    return { ...t, roster: [...t.roster, { employeeId: emp.id, shift: emp.shift || '08:00 - 17:00' }] };
                  }
                  return t;
                });
              }
            }
          }

          return updatedTargets;
        });

        // Persist new targets to Firebase
        for (const newTarget of newTargetsToCreate) {
          try {
            await createTarget({ name: newTarget.name, roster: newTarget.roster });
            console.log('[App] New target saved to Firebase:', newTarget.name);
          } catch (error) {
            console.error('[App] Failed to create target:', error);
          }
        }
      }

      // Detect deleted employees (in gridData but not in newData)
      const newDataIds = new Set(newData.map(e => e.id));
      const deletedEmployees = gridData.filter(e => !newDataIds.has(e.id));

      if (deletedEmployees.length > 0) {
        // Remove from allEmployees
        setAllEmployees(prev => prev.filter(e => !deletedEmployees.some(d => d.id === e.id)));

        // Remove from all targets roster
        setTargets(prev => prev.map(target => ({
          ...target,
          roster: target.roster.filter(r => !deletedEmployees.some(d => d.id === r.employeeId))
        })));

        // Delete from Firebase
        for (const emp of deletedEmployees) {
          try {
            await deleteEmployee(emp.id);
            // Update targets in Firebase
            for (const target of targets) {
              if (target.roster.some(r => r.employeeId === emp.id)) {
                await updateTarget(target.id, {
                  ...target,
                  roster: target.roster.filter(r => r.employeeId !== emp.id)
                });
              }
            }
            console.log('[App] Deleted employee from grid:', emp.name);
          } catch (error) {
            console.error('[App] Failed to delete employee:', error);
          }
        }
      }

      // Debounce saving attendance changes to timesheets collection (500ms delay)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Save attendance to timesheets/{year}/{month} collection (month-specific)
          await saveAllTimesheets(year, month + 1, newData);
          console.log(`[App] Attendance saved to timesheets/${year}/${month + 1}`);
        } catch (error) {
          console.error('[App] Failed to save timesheet:', error);
        }
      }, 500);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    try {
      const { employees: importedEmployees, errors } = await importTimesheetFromExcel(file, allEmployees);

      if (errors.length > 0) {
        setErrorMsg(`Cảnh báo: ${errors.join(', ')}`);
      }

      if (importedEmployees.length > 0) {
        // Merge with existing grid data
        const updatedGridData = [...gridData];
        const updatedAllEmployees = [...allEmployees];
        const newEmployeesForTargets: Employee[] = [];

        importedEmployees.forEach(imported => {
          const existingInGrid = updatedGridData.findIndex(e => e.code === imported.code);
          if (existingInGrid >= 0) {
            updatedGridData[existingInGrid] = {
              ...updatedGridData[existingInGrid],
              attendance: { ...updatedGridData[existingInGrid].attendance, ...imported.attendance }
            };
          } else {
            updatedGridData.push(imported);
            newEmployeesForTargets.push(imported);
          }

          const existingInMaster = updatedAllEmployees.findIndex(e => e.code === imported.code);
          if (existingInMaster < 0) {
            updatedAllEmployees.push(imported);
          }
        });

        setGridData(updatedGridData);
        setAllEmployees(updatedAllEmployees);

        // Auto-create targets for new employees if department doesn't exist
        if (newEmployeesForTargets.length > 0) {
          const newTargetsToCreate: Target[] = [];

          setTargets(prevTargets => {
            let updatedTargets = [...prevTargets];

            for (const emp of newEmployeesForTargets) {
              if (emp.department && emp.id && emp.department !== 'Chưa xác định') {
                let matchingTarget = updatedTargets.find(t => t.name === emp.department);

                if (!matchingTarget) {
                  const newTarget: Target = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: emp.department,
                    roster: [{ employeeId: emp.id, shift: emp.shift || '08:00 - 17:00' }]
                  };
                  updatedTargets.push(newTarget);
                  newTargetsToCreate.push(newTarget);
                  console.log(`[App] Auto-created target from Excel: ${emp.department}`);
                } else if (!matchingTarget.roster.some(r => r.employeeId === emp.id)) {
                  updatedTargets = updatedTargets.map(t => {
                    if (t.id === matchingTarget!.id) {
                      return { ...t, roster: [...t.roster, { employeeId: emp.id, shift: emp.shift || '08:00 - 17:00' }] };
                    }
                    return t;
                  });
                }
              }
            }

            return updatedTargets;
          });

          // Persist new targets to Firebase
          for (const newTarget of newTargetsToCreate) {
            try {
              await createTarget({ name: newTarget.name, roster: newTarget.roster });
            } catch (error) {
              console.error('[App] Failed to create target:', error);
            }
          }
        }

        alert(`Đã nhập thành công ${importedEmployees.length} nhân viên từ file Excel!`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }

    // Reset file input
    if (importFileRef.current) {
      importFileRef.current.value = '';
    }
  };

  // Updated Logo URL
  const logoUrl = "https://www.appsheet.com/template/gettablefileurl?appName=Appsheet-325045268&tableName=Kho%20%E1%BA%A3nh&fileName=Kho%20%E1%BA%A3nh_Images%2Fa95c8148.%E1%BA%A2nh.072220.jpg";

  // --- RENDER LOADING STATE ---
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

  // --- RENDER LOGIN IF NOT AUTHENTICATED ---
  if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-lg overflow-hidden h-12 w-12 flex items-center justify-center shadow-lg">
                <img 
                  src={logoUrl}
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
            </div>
            <div>
                <h1 className="text-xl font-bold uppercase tracking-wide">Bạch Hổ Security</h1>
                <p className="text-blue-200 text-sm">Xin chào, {currentUser?.name} ({currentUser?.role === 'admin' ? 'Quản Trị' : 'Nhân Viên'})</p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center space-x-2 bg-blue-800 p-1 rounded-lg shadow-inner">
             <button 
                onClick={() => setCurrentView('timesheet')}
                className={`flex items-center px-4 py-2 rounded transition font-medium ${currentView === 'timesheet' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-700 text-blue-200'}`}
             >
                <LayoutDashboard size={18} className="mr-2"/> Chấm Công
             </button>
             {currentUser?.role === 'admin' && (
                 <>
                     <button 
                        onClick={() => setCurrentView('targets')}
                        className={`flex items-center px-4 py-2 rounded transition font-medium ${currentView === 'targets' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-700 text-blue-200'}`}
                     >
                        <MapPin size={18} className="mr-2"/> Mục Tiêu
                     </button>
                     <button 
                        onClick={() => setCurrentView('hr')}
                        className={`flex items-center px-4 py-2 rounded transition font-medium ${currentView === 'hr' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-700 text-blue-200'}`}
                     >
                        <Shield size={18} className="mr-2"/> Nhân Sự
                     </button>
                 </>
             )}
          </div>
          
           <div className="flex items-center space-x-2">
                {currentView === 'timesheet' && (
                    <div className="hidden lg:flex items-center space-x-2 mr-4">
                        <select 
                            value={month} 
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-blue-900 text-white border border-blue-600 rounded px-2 py-1 text-sm outline-none shadow-sm cursor-pointer hover:bg-blue-800 transition"
                        >
                            {Array.from({length: 12}).map((_, i) => (
                                <option key={i} value={i}>Tháng {i + 1}</option>
                            ))}
                        </select>
                        <input 
                            type="number" 
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-blue-900 text-white border border-blue-600 rounded px-2 py-1 w-20 text-sm outline-none shadow-sm hover:bg-blue-800 transition"
                        />
                    </div>
                )}
                
                <button 
                   onClick={() => setShowSettings(true)}
                   className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded shadow transition text-sm font-medium"
                   title="Cài đặt"
                >
                   <SettingsIcon size={16} />
                </button>
                
                <button 
                   onClick={handleLogout}
                   className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded shadow transition text-sm font-medium border border-red-500"
                   title="Đăng xuất"
                >
                   <LogOut size={16} />
                </button>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-hidden flex flex-col max-w-[1920px] mx-auto w-full">
        
        {currentView === 'timesheet' ? (
            <>
                {/* Actions Bar for Timesheet */}
                <div className="flex justify-end mb-4 space-x-2">
                    {/* Sync from Google Sheets */}
                    <SyncButton onSyncComplete={handleSyncComplete} />

                    {/* Backup to JSON */}
                    <BackupButton />

                    <button
                        onClick={() => setShowImageCapture(true)}
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded shadow transition text-sm font-medium text-white"
                    >
                        <Camera size={16} />
                        <span>Chụp Ảnh & Nhập Dữ Liệu</span>
                    </button>
                    <button
                        onClick={() => downloadTimesheetTemplate(year, month)}
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded shadow transition text-sm font-medium text-white"
                        title="Tải mẫu Excel để nhập chấm công"
                    >
                        <FileSpreadsheet size={16} />
                        <span>Tải Mẫu</span>
                    </button>
                    <button
                        onClick={() => importFileRef.current?.click()}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded shadow transition text-sm font-medium text-white"
                    >
                        <FileUp size={16} />
                        <span>Nhập Excel</span>
                    </button>
                    <button
                        onClick={() => exportToExcel(gridData, year, month)}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded shadow transition text-sm font-medium text-white"
                    >
                        <FileDown size={16} />
                        <span>Xuất Excel</span>
                    </button>
                    <button
                        onClick={() => exportPayrollToExcel(gridData, year, month)}
                        className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded shadow transition text-sm font-medium text-white"
                        title="Xuất bảng lương với tổng công, thưởng, phạt"
                    >
                        <DollarSign size={16} />
                        <span>Xuất Lương</span>
                    </button>
                    <input
                        ref={importFileRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImportExcel}
                        className="hidden"
                    />
                </div>

                {errorMsg && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded">
                        <div className="flex items-center mb-2">
                            <AlertCircle size={18} className="mr-2"/> 
                            <span className="font-semibold">Lỗi xử lý</span>
                        </div>
                        <div className="text-sm">{errorMsg}</div>
                        {errorMsg.includes('quota') && (
                            <div className="mt-2 text-xs text-red-500">
                                💡 Bạn có thể kiểm tra quota tại{' '}
                                <a href="https://ai.dev/usage?tab=rate-limit" target="_blank" rel="noopener noreferrer" className="underline">
                                    đây
                                </a>
                                {' '}hoặc đợi một lúc rồi thử lại.
                            </div>
                        )}
                    </div>
                )}

                {/* The Grid */}
                <TimesheetGrid 
                    year={year}
                    month={month}
                    data={gridData}
                    targets={targets}
                    allEmployees={allEmployees} // Pass the Master List here
                    onDataChange={handleGridChange}
                />
            </>
        ) : currentView === 'targets' ? (
            <TargetManagement 
                targets={targets}
                employees={allEmployees} // Use Master List for selection
                onUpdateTargets={handleUpdateTargets}
            />
        ) : (
            <HRManagement 
                employees={allEmployees} // Manage Master List
                gridData={gridData}
                year={year}
                month={month}
                currentUser={currentUser}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onAddEmployee={handleAddEmployee}
            />
        )}
        
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <p>* Dữ liệu được lưu trữ tạm thời trên trình duyệt.</p>
            <p>Phiên bản 1.2.1 - Bạch Hổ Security</p>
        </div>
      </main>

      {/* Settings Modal */}
      <Settings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Image Capture Modal */}
      {currentView === 'timesheet' && (
        <ImageCapture
          isOpen={showImageCapture}
          onClose={() => setShowImageCapture(false)}
          onDataExtracted={handleImageDataExtracted}
          existingEmployees={allEmployees}
        />
      )}
    </div>
  );
};

export default App;