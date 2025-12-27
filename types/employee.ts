/**
 * Employee domain types
 * Includes basic info, authentication, and payroll fields
 */

export interface Employee {
  id: string;
  code: string;
  name: string;
  department: string; // Used as "Mục Tiêu" in grid context
  shift: string; // "Thời Gian" - e.g., "08h00 - 17h00"
  attendance: Record<number, string>; // Day number -> attendance value

  // Authentication
  password?: string;
  role?: 'admin' | 'staff';

  // Payroll fields
  dailyRate?: number; // Lương theo ngày
  bonus?: number; // Thưởng
  penalty?: number; // Phạt
  note?: string; // Ghi chú lương
}
