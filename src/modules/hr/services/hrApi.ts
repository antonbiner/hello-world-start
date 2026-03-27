import { API_URL } from '@/config/api';
import { getAuthHeaders } from '@/utils/apiHeaders';
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

type ApiEnvelope<T> = { success?: boolean; data?: T } | T;

async function unwrapJson<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;
  return ((json as any)?.data ?? json) as T;
}

async function assertOk(res: Response, fallbackMessage: string) {
  if (res.ok) return;
  const err = await res.json().catch(() => ({ message: fallbackMessage }));
  throw new Error((err as any)?.message || fallbackMessage);
}

export const hrApi = {
  async getEmployees(): Promise<Array<{ user: any; salaryConfig?: EmployeeSalaryConfig | null }>> {
    // Frontend-first: prefer HR backend endpoint when available.
    // Fallback: use existing Users API so HR always has live staff data.
    try {
      const res = await fetch(`${API_URL}/api/hr/employees`, { method: 'GET', headers: getAuthHeaders() });
      await assertOk(res, 'Failed to fetch employees');
      return unwrapJson(res);
    } catch {
      const list = await usersApi.getAll();
      const users = (list?.users ?? []) as User[];
      return users
        .filter(u => u && u.isActive !== false)
        .map(u => ({ user: u, salaryConfig: null }));
    }
  },

  async getEmployeeDetail(id: number): Promise<any> {
    const res = await fetch(`${API_URL}/api/hr/employees/${id}`, { method: 'GET', headers: getAuthHeaders() });
    await assertOk(res, 'Failed to fetch employee detail');
    return unwrapJson(res);
  },

  async upsertSalaryConfig(userId: number, payload: Partial<EmployeeSalaryConfig>): Promise<EmployeeSalaryConfig> {
    const res = await fetch(`${API_URL}/api/hr/employees/${userId}/salary-config`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    await assertOk(res, 'Failed to update salary configuration');
    return unwrapJson(res);
  },

  async getAttendance(params: { month: number; year: number; userId?: number }): Promise<AttendanceRecord[]> {
    const qs = new URLSearchParams({
      month: String(params.month),
      year: String(params.year),
      ...(params.userId ? { userId: String(params.userId) } : {}),
    });
    const res = await fetch(`${API_URL}/api/hr/attendance?${qs.toString()}`, { method: 'GET', headers: getAuthHeaders() });
    await assertOk(res, 'Failed to fetch attendance');
    return unwrapJson(res);
  },

  async createAttendance(payload: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await fetch(`${API_URL}/api/hr/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    await assertOk(res, 'Failed to create attendance record');
    return unwrapJson(res);
  },

  async updateAttendance(id: number, payload: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await fetch(`${API_URL}/api/hr/attendance/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    await assertOk(res, 'Failed to update attendance record');
    return unwrapJson(res);
  },

  async importAttendance(rows: Array<Partial<AttendanceRecord>>): Promise<{ imported: number; errors?: any[] }> {
    const res = await fetch(`${API_URL}/api/hr/attendance/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rows }),
    });
    await assertOk(res, 'Failed to import attendance');
    return unwrapJson(res);
  },

  async getAttendanceSettings(): Promise<AttendanceSettings> {
    const res = await fetch(`${API_URL}/api/hr/attendance/settings`, { method: 'GET', headers: getAuthHeaders() });
    await assertOk(res, 'Failed to fetch attendance settings');
    return unwrapJson(res);
  },

  async updateAttendanceSettings(payload: Partial<AttendanceSettings>): Promise<AttendanceSettings> {
    const res = await fetch(`${API_URL}/api/hr/attendance/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    await assertOk(res, 'Failed to update attendance settings');
    return unwrapJson(res);
  },

  async getLeaveBalances(year: number): Promise<LeaveBalance[]> {
    const res = await fetch(`${API_URL}/api/hr/leaves/balances?year=${year}`, { method: 'GET', headers: getAuthHeaders() });
    await assertOk(res, 'Failed to fetch leave balances');
    return unwrapJson(res);
  },

  async setLeaveAllowance(userId: number, payload: { year: number; leaveType: string; annualAllowance: number }): Promise<LeaveBalance[]> {
    const res = await fetch(`${API_URL}/api/hr/leaves/balances/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    await assertOk(res, 'Failed to set leave allowance');
    return unwrapJson(res);
  },

  async generatePayrollRun(payload: { month: number; year: number }): Promise<PayrollRun> {
    const res = await fetch(`${API_URL}/api/hr/payroll/run`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    await assertOk(res, 'Failed to generate payroll run');
    return unwrapJson(res);
  },

  async listPayrollRuns(year: number): Promise<PayrollRun[]> {
    const res = await fetch(`${API_URL}/api/hr/payroll/runs?year=${year}`, { method: 'GET', headers: getAuthHeaders() });
    await assertOk(res, 'Failed to fetch payroll runs');
    return unwrapJson(res);
  },

  async getPayrollRun(id: number): Promise<PayrollRun> {
    const res = await fetch(`${API_URL}/api/hr/payroll/runs/${id}`, { method: 'GET', headers: getAuthHeaders() });
    await assertOk(res, 'Failed to fetch payroll run');
    return unwrapJson(res);
  },

  async confirmPayrollRun(id: number): Promise<PayrollRun> {
    const res = await fetch(`${API_URL}/api/hr/payroll/runs/${id}/confirm`, { method: 'PUT', headers: getAuthHeaders() });
    await assertOk(res, 'Failed to confirm payroll run');
    return unwrapJson(res);
  },

  async getPaySlip(entryId: number): Promise<any> {
    const res = await fetch(`${API_URL}/api/hr/payroll/payslip/${entryId}`, { method: 'GET', headers: getAuthHeaders() });
    await assertOk(res, 'Failed to fetch payslip');
    return unwrapJson(res);
  },

  // Departments (backend-ready: uses localStorage fallback when API unavailable)
  async getDepartments(): Promise<Department[]> {
    try {
      const res = await fetch(`${API_URL}/api/hr/departments`, { method: 'GET', headers: getAuthHeaders() });
      await assertOk(res, 'Failed to fetch departments');
      return unwrapJson(res);
    } catch {
      return loadDepartmentsFromStorage();
    }
  },

  async createDepartment(payload: Partial<Department>): Promise<Department> {
    try {
      const res = await fetch(`${API_URL}/api/hr/departments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      await assertOk(res, 'Failed to create department');
      return unwrapJson(res);
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
      const res = await fetch(`${API_URL}/api/hr/departments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      await assertOk(res, 'Failed to update department');
      return unwrapJson(res);
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
      const res = await fetch(`${API_URL}/api/hr/departments/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      await assertOk(res, 'Failed to delete department');
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

