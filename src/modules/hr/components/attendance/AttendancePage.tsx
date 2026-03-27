import { useMemo, useState, lazy, Suspense, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceImport } from './AttendanceImport';
import { AttendanceManualEntry } from './AttendanceManualEntry';
import { AttendanceSettings } from './AttendanceSettings';
import { useAttendance } from '../../hooks/useAttendance';
import { useEmployees } from '../../hooks/useEmployees';
import { cn } from '@/lib/utils';
import type { Column } from 'react-data-grid';
import type { AttendanceRecord } from '../../types/hr.types';
import 'react-data-grid/lib/styles.css';
import { UserAvatar } from '@/components/ui/user-avatar';
import { HRPageHeader } from '../HRPageHeader';
import { CalendarDays, Plus, Upload, ChevronLeft, ChevronRight, RefreshCcw, BarChart3 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchAndFilterBar, type FilterGroup } from '@/shared/components/SearchAndFilterBar';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Lazy-load react-data-grid and normalize its export shape (matches existing project pattern)
const DataGridAsync = lazy(async () => {
  const mod = await import('react-data-grid');
  const Comp = (mod as any).DataGrid ?? (mod as any).default ?? (mod as any);
  return { default: Comp } as any;
});

type GridRow = {
  id: string;
  userId: number;
  name: string;
  profilePictureUrl?: string | null;
  [key: string]: any;
};

export function AttendancePage() {
  const { t } = useTranslation('hr');
  const now = dayjs();
  const [month, setMonth] = useState<number>(now.month() + 1);
  const [year, setYear] = useState<number>(now.year());
  const [importOpen, setImportOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ userId: number; date: string } | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ employeeId?: string; status?: string }>({ employeeId: 'all', status: 'all' });
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'missing_checkout' | 'late' | 'overtime'>('all');

  const {
    attendanceQuery,
    importAttendance,
    createAttendance,
    attendanceSettingsQuery,
    updateAttendanceSettings,
  } = useAttendance({ month, year });

  const { employeesQuery } = useEmployees();

  const rows = attendanceQuery.data ?? [];
  const employees = employeesQuery.data ?? [];
  const settings = attendanceSettingsQuery.data ?? null;

  const summary = useMemo(() => {
    const byUser: Record<string, { userId: number; days: number; hours: number; overtime: number }> = {};
    for (const r of rows) {
      const key = String(r.userId);
      if (!byUser[key]) byUser[key] = { userId: r.userId, days: 0, hours: 0, overtime: 0 };
      byUser[key].days += 1;
      byUser[key].hours += Number(r.hoursWorked || 0);
      byUser[key].overtime += Number(r.overtimeHours || 0);
    }
    return Object.values(byUser);
  }, [rows]);

  const statusSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      counts[r.status] = (counts[r.status] || 0) + 1;
    }
    return counts;
  }, [rows]);

  const daysInMonth = useMemo(() => dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth(), [year, month]);
  const holidaySet = useMemo(() => new Set((settings?.holidays ?? []).map(String)), [settings?.holidays]);
  const weekendDays = useMemo(() => new Set((settings?.weekendDays ?? [5, 6]).map(Number)), [settings?.weekendDays]);

  const anomalies = useMemo(() => {
    const missCheckout = new Set<number>();
    const late = new Set<number>();
    const overtime = new Set<number>();

    for (const r of rows) {
      const uid = Number(r.userId);
      if (!Number.isFinite(uid)) continue;
      if (r.checkIn && !r.checkOut) missCheckout.add(uid);
      if (String(r.status) === 'late') late.add(uid);
      if (Number(r.overtimeHours || 0) > 0) overtime.add(uid);
    }

    const count = (set: Set<number>) => {
      if (activeFilters.employeeId !== 'all') {
        return set.has(Number(activeFilters.employeeId)) ? 1 : 0;
      }
      return set.size;
    };

    return {
      missingCheckout: { users: missCheckout, count: count(missCheckout) },
      late: { users: late, count: count(late) },
      overtime: { users: overtime, count: count(overtime) },
    };
  }, [activeFilters.employeeId, rows]);

  const attendanceByUserDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of rows) {
      map.set(`${r.userId}__${r.date}`, r);
    }
    return map;
  }, [rows]);

  const getDerivedCell = useCallback((userId: number, date: string) => {
    const rec = attendanceByUserDate.get(`${userId}__${date}`) ?? null;
    const d = dayjs(date);
    const isWeekend = weekendDays.has(d.day());
    const isHoliday = holidaySet.has(date);

    if (rec) {
      const missingCheckout = Boolean(rec.checkIn && !rec.checkOut);
      const isLate = String(rec.status) === 'late';
      const hasOvertime = Number(rec.overtimeHours || 0) > 0;
      return { rec, kind: rec.status, anomaly: { missingCheckout, isLate, hasOvertime } };
    }
    if (isHoliday) return { rec: null, kind: 'holiday' as const };
    if (isWeekend) return { rec: null, kind: 'weekend' as const };
    return { rec: null, kind: 'empty' as const };
  }, [attendanceByUserDate, weekendDays, holidaySet]);

  const gridRowsAll: GridRow[] = useMemo(() => {
    return employees.map((e: any) => {
      const user = e.user ?? {};
      const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || `#${user.id}`;
      const row: GridRow = { id: String(user.id), userId: Number(user.id), name, profilePictureUrl: user.profilePictureUrl ?? null };

      for (let day = 1; day <= daysInMonth; day++) {
        const date = dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`).format('YYYY-MM-DD');
        row[`d${day}`] = date;
      }
      return row;
    });
  }, [employees, daysInMonth, month, year]);

  const filterGroups: FilterGroup[] = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    for (const r of rows) {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    }
    return [
      {
        key: 'employeeId',
        label: t('filters.employee'),
        options: gridRowsAll.map(r => ({ value: String(r.userId), label: r.name })),
      },
      {
        key: 'status',
        label: t('filters.status'),
        options: Object.keys(statusCounts).sort().map(k => ({
          value: k,
          label: t(`attendanceStatus.${k}`),
          count: statusCounts[k],
        })),
      },
    ];
  }, [gridRowsAll, rows, t]);

  const gridRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return gridRowsAll.filter(r => {
      const matchesQ = q === '' || r.name.toLowerCase().includes(q);
      const matchesEmployee = activeFilters.employeeId === 'all' || String(r.userId) === String(activeFilters.employeeId);
      return matchesQ && matchesEmployee;
    });
  }, [activeFilters.employeeId, gridRowsAll, searchTerm]);

  const listRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter(r => {
      const matchesQ =
        q === '' ||
        String(r.userId).includes(q) ||
        String(r.date).includes(q) ||
        String(r.notes || '').toLowerCase().includes(q);
      const matchesEmployee = activeFilters.employeeId === 'all' || String(r.userId) === String(activeFilters.employeeId);
      const matchesStatus = activeFilters.status === 'all' || String(r.status) === String(activeFilters.status);
      const matchesAnomaly =
        anomalyFilter === 'all' ||
        (anomalyFilter === 'missing_checkout' ? Boolean(r.checkIn && !r.checkOut) :
        anomalyFilter === 'late' ? String(r.status) === 'late' :
        anomalyFilter === 'overtime' ? Number(r.overtimeHours || 0) > 0 :
        true);
      return matchesQ && matchesEmployee && matchesStatus && matchesAnomaly;
    });
  }, [activeFilters.employeeId, activeFilters.status, anomalyFilter, rows, searchTerm]);

  const usersById = useMemo(() => {
    const map = new Map<number, { name: string; profilePictureUrl?: string | null }>();
    for (const e of employees) {
      const user = e.user ?? {};
      const id = Number(user.id);
      if (!Number.isFinite(id)) continue;
      const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || `#${user.id}`;
      map.set(id, { name, profilePictureUrl: user.profilePictureUrl ?? null });
    }
    return map;
  }, [employees]);

  const monthLabel = useMemo(() => {
    return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('MMMM YYYY');
  }, [month, year]);

  const statusClass = (kind: string) => {
    switch (kind) {
      case 'present':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200';
      case 'absent':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-200';
      case 'late':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-200';
      case 'half_day':
        return 'bg-orange-500/15 text-orange-800 dark:text-orange-200';
      case 'leave':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-200';
      case 'holiday':
        return 'bg-zinc-500/10 text-muted-foreground';
      case 'weekend':
        return 'bg-zinc-500/5 text-muted-foreground';
      default:
        return 'bg-transparent';
    }
  };

  const anomalyPill = (type: 'missing_checkout' | 'late' | 'overtime') => {
    switch (type) {
      case 'missing_checkout':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-200';
      case 'late':
        return 'bg-amber-500/10 text-amber-800 dark:text-amber-200';
      case 'overtime':
        return 'bg-violet-500/10 text-violet-700 dark:text-violet-200';
    }
  };

  const columns: Column<GridRow>[] = useMemo(() => {
    const cols: Column<GridRow>[] = [
      {
        key: 'name',
        name: t('employee.name'),
        frozen: true,
        resizable: true,
        width: 220,
        renderCell: ({ row }) => (
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar src={row.profilePictureUrl} name={row.name} seed={row.userId} size="sm" />
            <div className="truncate font-medium">{row.name}</div>
          </div>
        ),
      },
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      cols.push({
        key: `d${day}`,
        name: String(day),
        width: 44,
        resizable: false,
        sortable: false,
        renderCell: ({ row }) => {
          const date: string = row[`d${day}`];
          const { rec, kind, anomaly } = getDerivedCell(row.userId, date) as any;

          const main = rec?.hoursWorked != null ? String(rec.hoursWorked) : (kind === 'empty' ? '' : '');
          const sub = rec?.overtimeHours ? `+${rec.overtimeHours}` : '';
          const ring =
            anomaly?.missingCheckout ? 'ring-1 ring-rose-500/50' :
            anomaly?.isLate ? 'ring-1 ring-amber-500/50' :
            anomaly?.hasOvertime ? 'ring-1 ring-violet-500/50' :
            '';

          return (
            <button
              type="button"
              className={cn(
                'h-full w-full rounded-md px-1 py-1 text-[11px] leading-tight text-left transition-colors',
                'hover:bg-muted/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                statusClass(kind),
                ring
              )}
              title={rec ? `${t(`attendanceStatus.${rec.status}`)} • ${date}` : `${date}`}
              onClick={() => {
                setSelectedCell({ userId: row.userId, date });
                setManualOpen(true);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{main}</span>
                <span className="text-[10px] opacity-70">{sub}</span>
              </div>
            </button>
          );
        },
      });
    }

    return cols;
  }, [daysInMonth, getDerivedCell, t]);

  return (
    <div className="flex flex-col">
      <HRPageHeader
        title={t('attendance')}
        subtitle={t('attendancePage.subtitle')}
        icon={CalendarDays}
        backTo={{ to: '/dashboard/hr', label: t('dashboard') }}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/hr/attendance/reports" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('reports.title')}
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setManualOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('attendancePage.manualEntry')}
            </Button>
            <Button size="sm" onClick={() => setImportOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              {t('attendancePage.importExcel')}
            </Button>
          </div>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4">
        <Card className="shadow-card border-0 bg-card">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const d = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).subtract(1, 'month');
                    setMonth(d.month() + 1);
                    setYear(d.year());
                  }}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('common.prev')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const d = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).add(1, 'month');
                    setMonth(d.month() + 1);
                    setYear(d.year());
                  }}
                  className="gap-2"
                >
                  {t('common.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const d = dayjs();
                    setMonth(d.month() + 1);
                    setYear(d.year());
                  }}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {t('common.today')}
                </Button>
              </div>

              <div className="text-sm font-semibold text-foreground">{monthLabel}</div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="grid" className="space-y-4">
        <TabsList className={cn("w-full h-auto p-1 bg-muted/50 rounded-lg grid grid-cols-3 gap-1")}>
          <TabsTrigger value="grid" className="px-4 py-2.5 text-sm font-medium">{t('attendancePage.gridTab')}</TabsTrigger>
          <TabsTrigger value="summary" className="px-4 py-2.5 text-sm font-medium">{t('attendancePage.summary')}</TabsTrigger>
          <TabsTrigger value="settings" className="px-4 py-2.5 text-sm font-medium">{t('attendancePage.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-3">
          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{t('attendancePage.monthlyGridTitle')}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {(['present', 'absent', 'late', 'leave'] as const).map((k) => (
                    <Badge
                      key={k}
                      variant="secondary"
                      className={cn("text-[11px] font-medium", statusClass(k))}
                    >
                      {t(`attendanceStatus.${k}`)}: {statusSummary[k] || 0}
                    </Badge>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('list');
                      setAnomalyFilter('missing_checkout');
                    }}
                  >
                    <Badge variant="secondary" className={cn("text-[11px] font-medium", anomalyPill('missing_checkout'))}>
                      {t('attendanceAnomalies.missingCheckout')}: {anomalies.missingCheckout.count}
                    </Badge>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('list');
                      setAnomalyFilter('overtime');
                    }}
                  >
                    <Badge variant="secondary" className={cn("text-[11px] font-medium", anomalyPill('overtime'))}>
                      {t('attendanceAnomalies.overtime')}: {anomalies.overtime.count}
                    </Badge>
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {employees.length === 0 && !employeesQuery.isLoading ? (
                <Alert>
                  <AlertDescription>
                    {t('attendancePage.noEmployeesHint')}
                  </AlertDescription>
                </Alert>
              ) : null}

              {(employeesQuery.isLoading || attendanceQuery.isLoading) ? (
                <div className="text-sm text-muted-foreground">{t('loading')}</div>
              ) : (employeesQuery.error || attendanceQuery.error) ? (
                <div className="text-sm text-destructive">{String(employeesQuery.error || attendanceQuery.error)}</div>
              ) : rows.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-sm font-medium">{t('attendancePage.emptyTitle')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('attendancePage.emptyHint')}</div>
                </div>
              ) : (
                <div className="space-y-3">
                    <SearchAndFilterBar
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      placeholder={t('common.searchPlaceholder')}
                      filterGroups={filterGroups}
                      activeFilters={activeFilters as any}
                      onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value as string }))}
                      onClearFilters={() => setActiveFilters({ employeeId: 'all', status: 'all' })}
                      labels={{
                        allPrefix: t('common.all'),
                        clearAll: t('common.clearAll'),
                        filters: t('common.filters'),
                        filtersTitle: t('common.filters'),
                        selectPrefix: t('common.select'),
                        filterCountSuffixSingular: t('common.filter'),
                        filterCountSuffixPlural: t('common.filtersPlural'),
                      }}
                      fullWidth
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        {(['all', 'missing_checkout', 'late', 'overtime'] as const).map((k) => (
                          <Button
                            key={k}
                            size="sm"
                            variant={anomalyFilter === k ? 'default' : 'outline'}
                            onClick={() => setAnomalyFilter(k)}
                          >
                            {k === 'all' ? t('attendanceAnomalies.all') : t(`attendanceAnomalies.${k}`)}
                          </Button>
                        ))}
                      </div>
                      {anomalyFilter !== 'all' ? (
                        <div className="text-xs text-muted-foreground">
                          {t('attendanceAnomalies.filteredHint')}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={cn('px-2 py-1 rounded', statusClass('present'))}>{t('attendanceStatus.present')}</span>
                        <span className={cn('px-2 py-1 rounded', statusClass('absent'))}>{t('attendanceStatus.absent')}</span>
                        <span className={cn('px-2 py-1 rounded', statusClass('late'))}>{t('attendanceStatus.late')}</span>
                        <span className={cn('px-2 py-1 rounded', statusClass('leave'))}>{t('attendanceStatus.leave')}</span>
                        <span className={cn('px-2 py-1 rounded', statusClass('holiday'))}>{t('attendanceStatus.holiday')}</span>
                        <span className={cn('px-2 py-1 rounded', statusClass('weekend'))}>{t('attendancePage.weekend')}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={viewMode === 'matrix' ? 'default' : 'outline'}
                          onClick={() => setViewMode('matrix')}
                        >
                          {t('attendancePage.matrixView')}
                        </Button>
                        <Button
                          size="sm"
                          variant={viewMode === 'list' ? 'default' : 'outline'}
                          onClick={() => setViewMode('list')}
                        >
                          {t('attendancePage.listView')}
                        </Button>
                      </div>
                    </div>

                    {viewMode === 'matrix' ? (
                      <div className="border rounded-md overflow-hidden">
                        <div style={{ height: 520 }}>
                          <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">{t('loading')}</div>}>
                            <DataGridAsync
                              columns={columns}
                              rows={gridRows}
                              rowKeyGetter={(r: GridRow) => r.id}
                              className="rdg-light fill-grid"
                              headerRowHeight={36}
                              rowHeight={36}
                              enableVirtualization
                            />
                          </Suspense>
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('employee.employee')}</TableHead>
                            <TableHead>{t('attendanceFields.date')}</TableHead>
                            <TableHead>{t('attendanceFields.checkIn')}</TableHead>
                            <TableHead>{t('attendanceFields.checkOut')}</TableHead>
                            <TableHead>{t('attendanceFields.status')}</TableHead>
                            <TableHead>{t('attendanceFields.hoursWorked')}</TableHead>
                            <TableHead>{t('attendanceFields.overtimeHours')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {listRows.map(r => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">
                                {(() => {
                                  const u = usersById.get(Number(r.userId));
                                  const nm = u?.name ?? `#${r.userId}`;
                                  return (
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <UserAvatar src={u?.profilePictureUrl} name={nm} seed={Number(r.userId)} size="sm" />
                                      <div className="truncate">{nm}</div>
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell>{r.date}</TableCell>
                              <TableCell>{r.checkIn ?? '—'}</TableCell>
                              <TableCell>{r.checkOut ?? '—'}</TableCell>
                              <TableCell>
                                <span className={cn("inline-flex items-center rounded px-2 py-1 text-xs font-medium", statusClass(r.status))}>
                                  {t(`attendanceStatus.${r.status}`)}
                                </span>
                                {r.checkIn && !r.checkOut ? (
                                  <span className={cn("ml-2 inline-flex items-center rounded px-2 py-1 text-xs font-medium", anomalyPill('missing_checkout'))}>
                                    {t('attendanceAnomalies.missingCheckout')}
                                  </span>
                                ) : null}
                                {Number(r.overtimeHours || 0) > 0 ? (
                                  <span className={cn("ml-2 inline-flex items-center rounded px-2 py-1 text-xs font-medium", anomalyPill('overtime'))}>
                                    {t('attendanceAnomalies.overtime')}
                                  </span>
                                ) : null}
                              </TableCell>
                              <TableCell>{r.hoursWorked ?? '—'}</TableCell>
                              <TableCell>{r.overtimeHours ?? '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-3">
          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t('attendancePage.summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('employee.employee')}</TableHead>
                    <TableHead>{t('attendancePage.days')}</TableHead>
                    <TableHead>{t('attendanceFields.hoursWorked')}</TableHead>
                    <TableHead>{t('attendanceFields.overtimeHours')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map(s => (
                    <TableRow key={s.userId}>
                      <TableCell className="font-medium">
                        {(() => {
                          const u = usersById.get(Number(s.userId));
                          const nm = u?.name ?? `#${s.userId}`;
                          return (
                            <div className="flex items-center gap-2.5 min-w-0">
                              <UserAvatar src={u?.profilePictureUrl} name={nm} seed={Number(s.userId)} size="sm" />
                              <div className="truncate">{nm}</div>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>{s.days}</TableCell>
                      <TableCell>{s.hours.toFixed(2)}</TableCell>
                      <TableCell>{s.overtime.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-3">
          <AttendanceSettings
            initial={attendanceSettingsQuery.data ?? null}
            isSaving={updateAttendanceSettings.isPending}
            onSave={async (values) => {
              await updateAttendanceSettings.mutateAsync(values);
            }}
          />
        </TabsContent>
        </Tabs>
      </div>

      <AttendanceImport
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={async (importedRows) => {
          await importAttendance.mutateAsync(importedRows);
        }}
      />

      <AttendanceManualEntry
        open={manualOpen}
        onOpenChange={setManualOpen}
        defaultUserId={selectedCell?.userId}
        defaultDate={selectedCell?.date}
        onSubmit={async (payload) => {
          await createAttendance.mutateAsync(payload);
        }}
        isSubmitting={createAttendance.isPending}
      />
    </div>
  );
}

