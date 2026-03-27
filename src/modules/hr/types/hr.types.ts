export interface EmployeeSalaryConfig {
  id: number;
  userId: number;
  grossSalary: number; // Monthly in TND
  isHeadOfFamily: boolean;
  childrenCount: number;
  customDeductions?: number;
  bankAccount?: string;
  cnssNumber?: string;
  hireDate?: string;
  department?: string;
  position?: string;
  employmentType: 'full_time' | 'part_time' | 'contract';

  // Dedicated HR fields (frontend-first; backend can persist later)
  cin?: string; // Tunisian ID
  birthDate?: string; // YYYY-MM-DD
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  date: string; // ISO date
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  breakDuration?: number; // minutes
  source: 'manual' | 'import' | 'fingerprint' | 'external';
  rawData?: Record<string, any>;
  hoursWorked?: number;
  overtimeHours?: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave' | 'holiday';
  notes?: string;
}

export interface AttendanceSettings {
  id: number;
  weekendDays: number[];
  standardHoursPerDay: number;
  overtimeThreshold: number;
  overtimeMultiplier: number;
  roundingMethod: 'none' | '15min' | '30min' | 'hour';
  calculationMethod: 'actual_hours' | 'standard_day' | 'custom';
  lateThresholdMinutes: number;
  holidays: string[];
}

export interface PayrollRun {
  id: number;
  month: number;
  year: number;
  status: 'draft' | 'confirmed' | 'paid';
  entries: PayrollEntry[];
  totalGross: number;
  totalNet: number;
  createdBy: number;
  createdAt: string;
  confirmedAt?: string;
}

export interface PayrollEntry {
  id: number;
  payrollRunId: number;
  userId: number;
  userName: string;
  grossSalary: number;
  cnss: number;
  taxableGross: number;
  abattement: number;
  taxableBase: number;
  irpp: number;
  css: number;
  netSalary: number;
  workedDays: number;
  totalHours: number;
  overtimeHours: number;
  leaveDays: number;
  details: Record<string, any>;
}

export interface LeaveBalance {
  userId: number;
  leaveType: string;
  annualAllowance: number;
  used: number;
  remaining: number;
  pending: number;
}

export interface Department {
  id: number;
  name: string;
  code?: string;
  parentId?: number | null;
  managerId?: number | null;
  description?: string;
  position?: number;
}

export interface SalaryInput {
  grossSalary: number;
  isHeadOfFamily: boolean;
  childrenCount: number;
  customDeductions?: number;
}

export interface IRPPBracketDetail {
  from: number;
  to: number;
  rate: number;
  taxableInBracket: number;
  taxAmount: number;
}

export interface SalaryBreakdown {
  grossSalary: number;
  cnss: number;
  cnssRate: number;
  taxableGross: number;
  abattement: number;
  abattementDetail: { headOfFamily: number; children: number };
  taxableBase: number;
  irpp: number;
  irppBrackets: IRPPBracketDetail[];
  css: number;
  cssRate: number;
  netSalary: number;
}

