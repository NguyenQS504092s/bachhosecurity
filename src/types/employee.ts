/**
 * Employee domain types
 * Includes basic info, authentication, and payroll fields
 */

export interface Employee {
  id: string;
  code: string; // MSNV
  name: string; // Họ và tên
  department: string; // Mục Tiêu / Ten_muc_tieu
  shift: string; // Thời Gian / Giờ/ngày - e.g., "08h00 - 17h00"
  attendance: Record<number, string>; // Day number -> attendance value

  // Authentication
  password?: string;
  role?: 'admin' | 'staff';

  // Banking
  bankAccount?: string; // So_tai_khoan

  // Payroll fields - Salary components
  dailyRate?: number; // Lương theo ngày
  standardHours?: number; // Gio_cong_chuan
  shiftSalary?: number; // Luong_ca
  responsibilitySalary?: number; // Luong_trach_nhiem
  supportSalary?: number; // Luong_ho_tro
  managementSalary?: number; // Luong_quan_ly

  // Payroll fields - Deductions & Advances
  advance1?: number; // Ung_luong_lan1
  advance2?: number; // Ung_luong_lan2
  advance3?: number; // Ung_luong_lan3
  refund?: number; // Hoan_tien
  socialInsurance?: number; // BHXH
  uniform?: number; // Dong_phuc

  // Legacy payroll fields
  bonus?: number; // Thưởng (legacy)
  penalty?: number; // Tien_phat
  note?: string; // Ghi_chu
}
