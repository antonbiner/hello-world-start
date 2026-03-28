import axiosInstance from '@/services/api/axiosInstance';
import { usersApi } from '@/services/api/usersApi';
import type { User } from '@/types/users';
import type {
  AttendanceRecord,
  AttendanceSettings,
  Department,
  EmployeeSalaryConfig,
  LeaveBalance,
  PayrollRun,
} from '../types/hr.types';

function unwrapData<T>(response: { data: any }): T {
  const json = response.data;
  return (json?.data ?? json) as T;
}

export const hrApi = {
  async getEmployees(): Promise<Array<{ user: any; salaryConfig?: EmployeeSalaryConfig | null }>> {
    try {
      const res = await axiosInstance.get('/api/hr/employees');
      return unwrapData(res);
    } catch {
      const list = await usersApi.getAll();
      const users = (list?.users ?? []) as User[];
      return users
        .filter(u => u && u.isActive !== false)
        .map(u => ({ user: u, salaryConfig: null }));
    }
  },

  async getEmployeeDetail(id: number): Promise<any> {
    const res = await axiosInstance.get(`/api/hr/employees/${id}`);
    return unwrapData(res);
  },

  async upsertSalaryConfig(userId: number, payload: Partial<EmployeeSalaryConfig>): Promise<EmployeeSalaryConfig> {
    const res = await axiosInstance.put(`/api/hr/employees/${userId}/salary-config`, payload);
    return unwrapData(res);
  },

  async getAttendance(params: { month: number; year: number; userId?: number }): Promise<AttendanceRecord[]> {
    const qs = new URLSearchParams({
      month: String(params.month),
      year: String(params.year),
      ...(params.userId ? { userId: String(params.userId) } : {}),
    });
    const res = await axiosInstance.get(`/api/hr/attendance?${qs.toString()}`);
    return unwrapData(res);
  },

  async createAttendance(payload: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await axiosInstance.post('/api/hr/attendance', payload);
    return unwrapData(res);
  },

  async updateAttendance(id: number, payload: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await axiosInstance.put(`/api/hr/attendance/${id}`, payload);
    return unwrapData(res);
  },

  async importAttendance(rows: Array<Partial<AttendanceRecord>>): Promise<{ imported: number; errors?: any[] }> {
    const res = await axiosInstance.post('/api/hr/attendance/import', { rows });
    return unwrapData(res);
  },

  async getAttendanceSettings(): Promise<AttendanceSettings> {
    const res = await axiosInstance.get('/api/hr/attendance/settings');
    return unwrapData(res);
  },

  async updateAttendanceSettings(payload: Partial<AttendanceSettings>): Promise<AttendanceSettings> {
    const res = await axiosInstance.put('/api/hr/attendance/settings', payload);
    return unwrapData(res);
  },

  async getLeaveBalances(year: number): Promise<LeaveBalance[]> {
    const res = await axiosInstance.get(`/api/hr/leaves/balances?year=${year}`);
    return unwrapData(res);
  },

  async setLeaveAllowance(userId: number, payload: { year: number; leaveType: string; annualAllowance: number }): Promise<LeaveBalance[]> {
    const res = await axiosInstance.put(`/api/hr/leaves/balances/${userId}`, payload);
    return unwrapData(res);
  },

  async generatePayrollRun(payload: { month: number; year: number }): Promise<PayrollRun> {
    const res = await axiosInstance.post('/api/hr/payroll/run', payload);
    return unwrapData(res);
  },

  async listPayrollRuns(year: number): Promise<PayrollRun[]> {
    const res = await axiosInstance.get(`/api/hr/payroll/runs?year=${year}`);
    return unwrapData(res);
  },

  async getPayrollRun(id: number): Promise<PayrollRun> {
    const res = await axiosInstance.get(`/api/hr/payroll/runs/${id}`);
    return unwrapData(res);
  },

  async confirmPayrollRun(id: number): Promise<PayrollRun> {
    const res = await axiosInstance.put(`/api/hr/payroll/runs/${id}/confirm`);
    return unwrapData(res);
  },

  async getPaySlip(entryId: number): Promise<any> {
    const res = await axiosInstance.get(`/api/hr/payroll/payslip/${entryId}`);
    return unwrapData(res);
  },

  // Departments (backend-ready: uses localStorage fallback when API unavailable)
  async getDepartments(): Promise<Department[]> {
    try {
      const res = await axiosInstance.get('/api/hr/departments');
      return unwrapData(res);
    } catch {
      return loadDepartmentsFromStorage();
    }
  },

  async createDepartment(payload: Partial<Department>): Promise<Department> {
    try {
      const res = await axiosInstance.post('/api/hr/departments', payload);
      return unwrapData(res);
    } catch {
      const list = loadDepartmentsFromStorage();
      const id = list.length > 0 ? Math.max(...list.map(d => d.id)) + 1 : 1;
      const newDept: Department = { id, name: payload.name ?? '', ...payload };
      saveDepartmentsToStorage([...list, newDept]);
      return newDept;
    }
  },

  async updateDepartment(id: number, payload: Partial<Department>): Promise<Department> {
    try {
      const res = await axiosInstance.put(`/api/hr/departments/${id}`, payload);
      return unwrapData(res);
    } catch {
      const list = loadDepartmentsFromStorage();
      const idx = list.findIndex(d => d.id === id);
      if (idx < 0) throw new Error('Department not found');
      const updated = { ...list[idx], ...payload };
      list[idx] = updated;
      saveDepartmentsToStorage(list);
      return updated;
    }
  },

  async deleteDepartment(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/hr/departments/${id}`);
    } catch {
      const list = loadDepartmentsFromStorage().filter(d => d.id !== id);
      saveDepartmentsToStorage(list);
    }
  },
};

const DEPARTMENTS_STORAGE_KEY = 'hr_departments_v1';

function loadDepartmentsFromStorage(): Department[] {
  try {
    const raw = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDepartmentsToStorage(list: Department[]) {
  try {
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
