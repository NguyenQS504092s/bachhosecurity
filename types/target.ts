/**
 * Target (Mục Tiêu) domain types
 * Represents work locations with assigned employees
 */

export interface RosterItem {
  employeeId: string;
  shift: string;
}

export interface Target {
  id: string;
  name: string;
  roster: RosterItem[];
}
