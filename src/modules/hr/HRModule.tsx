import { Routes, Route, Navigate } from 'react-router-dom';
import { HRDashboard } from './components/HRDashboard';
import { EmployeeList } from './components/employees/EmployeeList';
import { EmployeeDetail } from './components/employees/EmployeeDetail';
import { AttendancePage } from './components/attendance/AttendancePage';
import { AttendanceReportsPage } from './components/attendance/AttendanceReportsPage';
import { LeavesPage } from './components/leaves/LeavesPage';
import { PayrollPage } from './components/payroll/PayrollPage';
import { DepartmentsPage } from './components/departments/DepartmentsPage';
import { OrgChartPage } from './components/departments/OrgChartPage';

export default function HRModule() {
  return (
    <Routes>
      <Route index element={<HRDashboard />} />
      <Route path="employees" element={<EmployeeList />} />
      <Route path="employees/:id" element={<EmployeeDetail />} />
      <Route path="attendance" element={<AttendancePage />} />
      <Route path="attendance/reports" element={<AttendanceReportsPage />} />
      <Route path="leaves" element={<LeavesPage />} />
      <Route path="payroll" element={<PayrollPage />} />
      <Route path="departments" element={<DepartmentsPage />} />
      <Route path="org-chart" element={<OrgChartPage />} />
      <Route path="*" element={<Navigate to="/dashboard/hr" replace />} />
    </Routes>
  );
}

