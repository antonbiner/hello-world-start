import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HRPageHeader } from '../HRPageHeader';
import { useAttendance } from '../../hooks/useAttendance';
import { useEmployees } from '../../hooks/useEmployees';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  Clock,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS: Record<string, string> = {
  present: 'hsl(var(--success))',
  late: 'hsl(var(--warning))',
  absent: 'hsl(var(--destructive))',
  half_day: 'hsl(25 95% 53%)',
  leave: 'hsl(199 89% 48%)',
  holiday: 'hsl(var(--muted-foreground))',
};

export function AttendanceReportsPage() {
  const { t } = useTranslation('hr');
  const { toast } = useToast();
  const now = dayjs();
  const [month, setMonth] = useState(now.month() + 1);
  const [year, setYear] = useState(now.year());

  const { attendanceQuery } = useAttendance({ month, year });
  const { employeesQuery } = useEmployees();

  const rows = attendanceQuery.data ?? [];
  const employees = employeesQuery.data ?? [];

  const monthLabel = useMemo(
    () => dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('MMMM YYYY'),
    [month, year]
  );

  const summary = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;
    let totalHours = 0;
    let totalOvertime = 0;

    for (const r of rows) {
      if (r.status === 'present') present++;
      else if (r.status === 'late') late++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'leave') leave++;
      totalHours += Number(r.hoursWorked || 0);
      totalOvertime += Number(r.overtimeHours || 0);
    }

    return { present, late, absent, leave, totalHours, totalOvertime };
  }, [rows]);

  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      counts[r.status] = (counts[r.status] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({
      name: t(`attendanceStatus.${name}`),
      value,
      status: name,
    }));
  }, [rows, t]);

  const dailyTrendData = useMemo(() => {
    const byDate: Record<string, { present: number; late: number; absent: number }> = {};
    for (const r of rows) {
      const d = String(r.date);
      if (!byDate[d]) byDate[d] = { present: 0, late: 0, absent: 0 };
      if (r.status === 'present') byDate[d].present++;
      else if (r.status === 'late') byDate[d].late++;
      else if (r.status === 'absent') byDate[d].absent++;
    }
    const daysInMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = dayjs(`${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`).format('YYYY-MM-DD');
      const data = byDate[date] ?? { present: 0, late: 0, absent: 0 };
      return {
        day: String(i + 1),
        date,
        label: dayjs(date).format('D MMM'),
        ...data,
      };
    });
  }, [rows, month, year]);

  const byDepartment = useMemo(() => {
    const map = new Map<string, { present: number; late: number; absent: number; leave: number; hours: number; overtime: number; count: number }>();

    const userToDept = new Map<number, string>();
    for (const e of employees) {
      const uid = Number(e?.user?.id);
      const dept = (e?.salaryConfig?.department ?? '—') || 'Unassigned';
      if (Number.isFinite(uid)) userToDept.set(uid, dept);
    }

    for (const r of rows) {
      const dept = userToDept.get(Number(r.userId)) ?? 'Unassigned';
      if (!map.has(dept)) {
        map.set(dept, { present: 0, late: 0, absent: 0, leave: 0, hours: 0, overtime: 0, count: 0 });
      }
      const entry = map.get(dept)!;
      entry.count++;
      if (r.status === 'present') entry.present++;
      else if (r.status === 'late') entry.late++;
      else if (r.status === 'absent') entry.absent++;
      else if (r.status === 'leave') entry.leave++;
      entry.hours += Number(r.hoursWorked || 0);
      entry.overtime += Number(r.overtimeHours || 0);
    }

    return Array.from(map.entries()).map(([department, data]) => ({ department, ...data }));
  }, [rows, employees]);

  const byEmployee = useMemo(() => {
    const userMap = new Map<number, { userId: number; name: string; department: string; present: number; late: number; absent: number; leave: number; hours: number; overtime: number }>();

    for (const e of employees) {
      const user = e?.user ?? {};
      const uid = Number(user.id);
      if (!Number.isFinite(uid)) continue;
      const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || `#${uid}`;
      const dept = (e?.salaryConfig?.department ?? '—') || 'Unassigned';
      userMap.set(uid, { userId: uid, name, department: dept, present: 0, late: 0, absent: 0, leave: 0, hours: 0, overtime: 0 });
    }

    for (const r of rows) {
      const entry = userMap.get(Number(r.userId));
      if (!entry) continue;
      if (r.status === 'present') entry.present++;
      else if (r.status === 'late') entry.late++;
      else if (r.status === 'absent') entry.absent++;
      else if (r.status === 'leave') entry.leave++;
      entry.hours += Number(r.hoursWorked || 0);
      entry.overtime += Number(r.overtimeHours || 0);
    }

    return Array.from(userMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, employees]);

  const handleExportExcel = () => {
    try {
      const wsData = [
        [t('reports.employee'), t('employee.department'), t('reports.present'), t('reports.late'), t('reports.absent'), t('reports.leave'), t('reports.hours'), t('reports.overtime')],
        ...byEmployee.map((row) => [row.name, row.department, row.present, row.late, row.absent, row.leave, row.hours.toFixed(1), row.overtime.toFixed(1)]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('reports.sheetName'));
      XLSX.writeFile(wb, `attendance-report-${year}-${String(month).padStart(2, '0')}.xlsx`);
      toast({ title: t('reports.exportSuccess') });
    } catch {
      toast({ title: t('reports.exportError'), variant: 'destructive' });
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="flex flex-col">
      <HRPageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        icon={BarChart3}
        backTo={{ to: '/dashboard/hr/attendance', label: t('attendance') }}
        actions={
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={rows.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {t('reports.exportExcel')}
          </Button>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6 space-y-6">
        {/* Period selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-base font-semibold min-w-[180px] text-center">{monthLabel}</span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card border-0 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.summaryPresent')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceQuery.isLoading ? '—' : summary.present}</div>
              <p className="text-xs text-muted-foreground">{t('reports.presentHint')}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.summaryLate')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceQuery.isLoading ? '—' : summary.late}</div>
              <p className="text-xs text-muted-foreground">{t('reports.lateHint')}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.summaryAbsent')}</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceQuery.isLoading ? '—' : summary.absent}</div>
              <p className="text-xs text-muted-foreground">{t('reports.absentHint')}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.summaryOvertime')}</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceQuery.isLoading ? '—' : summary.totalOvertime.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">{t('reports.overtimeHint')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t('reports.statusDistribution')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('reports.statusDistributionHint')}</p>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? 'hsl(var(--muted-foreground))'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value, t('reports.records')]}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    {attendanceQuery.isLoading ? t('loading') : t('reports.noData')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t('reports.dailyTrend')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('reports.dailyTrendHint')}</p>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                {dailyTrendData.some((d) => d.present > 0 || d.late > 0 || d.absent > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTrendData} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="present" stackId="a" fill="hsl(var(--success))" name={t('attendanceStatus.present')} />
                      <Bar dataKey="late" stackId="a" fill="hsl(var(--warning))" name={t('attendanceStatus.late')} />
                      <Bar dataKey="absent" stackId="a" fill="hsl(var(--destructive))" name={t('attendanceStatus.absent')} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    {attendanceQuery.isLoading ? t('loading') : t('reports.noData')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* By department */}
        <Card className="shadow-card border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-base">{t('reports.byDepartment')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('reports.byDepartmentHint')}</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('employee.department')}</TableHead>
                  <TableHead className="text-right">{t('reports.present')}</TableHead>
                  <TableHead className="text-right">{t('reports.late')}</TableHead>
                  <TableHead className="text-right">{t('reports.absent')}</TableHead>
                  <TableHead className="text-right">{t('reports.leave')}</TableHead>
                  <TableHead className="text-right">{t('reports.hours')}</TableHead>
                  <TableHead className="text-right">{t('reports.overtime')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byDepartment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground text-center py-8">
                      {attendanceQuery.isLoading ? t('loading') : t('reports.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  byDepartment.map((row) => (
                    <TableRow key={row.department}>
                      <TableCell className="font-medium">{row.department}</TableCell>
                      <TableCell className="text-right">{row.present}</TableCell>
                      <TableCell className="text-right">{row.late}</TableCell>
                      <TableCell className="text-right">{row.absent}</TableCell>
                      <TableCell className="text-right">{row.leave}</TableCell>
                      <TableCell className="text-right">{row.hours.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">{row.overtime.toFixed(1)}h</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* By employee */}
        <Card className="shadow-card border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-base">{t('reports.byEmployee')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('reports.byEmployeeHint')}</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('employee.name')}</TableHead>
                    <TableHead>{t('employee.department')}</TableHead>
                    <TableHead className="text-right">{t('reports.present')}</TableHead>
                    <TableHead className="text-right">{t('reports.late')}</TableHead>
                    <TableHead className="text-right">{t('reports.absent')}</TableHead>
                    <TableHead className="text-right">{t('reports.leave')}</TableHead>
                    <TableHead className="text-right">{t('reports.hours')}</TableHead>
                    <TableHead className="text-right">{t('reports.overtime')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byEmployee.map((row) => (
                    <TableRow key={row.userId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={row.name}
                            seed={row.userId}
                            size="sm"
                          />
                          <span className="font-medium">{row.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{row.department}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{row.present}</TableCell>
                      <TableCell className="text-right">{row.late}</TableCell>
                      <TableCell className="text-right">{row.absent}</TableCell>
                      <TableCell className="text-right">{row.leave}</TableCell>
                      <TableCell className="text-right">{row.hours.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">{row.overtime.toFixed(1)}h</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
