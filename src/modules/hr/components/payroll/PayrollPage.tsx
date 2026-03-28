import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PayrollRunDialog } from './PayrollRunDialog';
import { PayrollSettings } from './PayrollSettings';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { calculateTunisianNetSalary } from '../../utils/tunisianTaxEngine';
import { PaySlipDetail } from './PaySlipDetail';
import { formatTnd } from '../../utils/money';
import { HRPageHeader } from '../HRPageHeader';
import { Coins, Eye, FileDown, Wand2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmployees } from '../../hooks/useEmployees';
import { useAttendance } from '../../hooks/useAttendance';
import { schedulesApi, type UserLeave } from '@/services/api/schedulesApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserAvatar } from '@/components/ui/user-avatar';
import type { PayrollRun, PayrollEntry, SalaryBreakdown, EmployeeSalaryConfig } from '../../types/hr.types';
import { Checkbox } from '@/components/ui/checkbox';
import { pdf } from '@react-pdf/renderer';
import { PaySlipPDF } from './PaySlipPDF';
import { useToast } from '@/hooks/use-toast';

type DraftRun = PayrollRun & {
  kind: 'draft_local';
  entries: Array<PayrollEntry & { breakdown: SalaryBreakdown; issues?: string[] }>;
};

const LS_KEY = 'hr_payroll_draft_runs_v1';

function loadDraftRuns(): DraftRun[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DraftRun[];
  } catch {
    return [];
  }
}

function saveDraftRuns(runs: DraftRun[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(runs));
  } catch {
    // ignore storage errors
  }
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let idx = 0;

  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (idx < items.length) {
      const current = idx++;
      results[current] = await fn(items[current]);
    }
  });

  await Promise.all(workers);
  return results;
}

export function PayrollPage() {
  const { t } = useTranslation('hr');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftRuns, setDraftRuns] = useState<DraftRun[]>(() => loadDraftRuns());
  const [activeRunId, setActiveRunId] = useState<number | null>(draftRuns[0]?.id ?? null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeEntryUserId, setActiveEntryUserId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const { employeesQuery } = useEmployees();

  const activeRun = useMemo(() => draftRuns.find(r => r.id === activeRunId) ?? null, [activeRunId, draftRuns]);
  const periodMonth = activeRun?.month ?? (dayjs().month() + 1);
  const periodYear = activeRun?.year ?? dayjs().year();

  const { attendanceQuery } = useAttendance({ month: periodMonth, year: periodYear });

  const users = useMemo(() => {
    const rows = employeesQuery.data ?? [];
    return rows
      .map((r: any) => r.user)
      .filter(Boolean)
      .map((u: any) => ({
        id: Number(u.id),
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || `#${u.id}`,
        email: u.email ?? null,
        profilePictureUrl: u.profilePictureUrl ?? null,
      }))
      .filter((u: any) => Number.isFinite(u.id) && u.id > 0);
  }, [employeesQuery.data]);

  const salaryByUserId = useMemo(() => {
    const map = new Map<number, EmployeeSalaryConfig | null>();
    for (const r of (employeesQuery.data ?? []) as any[]) {
      const uid = Number(r?.user?.id);
      if (!Number.isFinite(uid)) continue;
      map.set(uid, (r?.salaryConfig ?? null) as any);
    }
    return map;
  }, [employeesQuery.data]);

  const leavesQuery = useQuery({
    queryKey: ['hr', 'payrollPlanningLeaves', periodYear, periodMonth, users.map(u => u.id)],
    enabled: users.length > 0,
    queryFn: async () => {
      const perUser = await mapWithConcurrency(users, 5, async (u) => {
        const leaves = await schedulesApi.getLeaves(u.id);
        return leaves.map(l => ({ ...l, userId: u.id, userName: u.name })) as (UserLeave & { userId: number; userName: string })[];
      });
      return perUser.flat();
    },
  });

  const statusBadgeClass = (status: string) => {
    switch (String(status)) {
      case 'draft':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-200';
      case 'confirmed':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-200';
      case 'paid':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200';
      default:
        return 'bg-zinc-500/10 text-muted-foreground';
    }
  };

  const monthRange = useMemo(() => {
    const start = dayjs(`${periodYear}-${String(periodMonth).padStart(2, '0')}-01`);
    return { start, end: start.endOf('month') };
  }, [periodMonth, periodYear]);

  const monthStats = useMemo(() => {
    const attendance = attendanceQuery.data ?? [];
    const leaves = leavesQuery.data ?? [];

    const totalHours = attendance.reduce((acc: number, r: any) => acc + Number(r.hoursWorked || 0), 0);
    const totalOvertime = attendance.reduce((acc: number, r: any) => acc + Number(r.overtimeHours || 0), 0);
    const pendingLeaves = leaves.filter((l: any) => String(l.status || 'pending') === 'pending').length;

    return { totalHours, totalOvertime, pendingLeaves };
  }, [attendanceQuery.data, leavesQuery.data]);

  const activeEntry = useMemo(() => {
    const uid = activeEntryUserId;
    if (!activeRun || !uid) return null;
    return activeRun.entries.find(e => e.userId === uid) ?? null;
  }, [activeEntryUserId, activeRun]);

  const pdfLabels = useMemo(() => {
    return {
      title: t('payrollDraft.pdf.title'),
      employee: t('payrollDraft.pdf.employee'),
      period: t('payrollDraft.pdf.period'),
      gross: t('payrollSlip.grossSalary'),
      cnss: t('payrollSlip.cnss'),
      taxableGross: t('payrollSlip.taxableGross'),
      abattement: t('payrollSlip.abattement'),
      taxableBase: t('payrollSlip.taxableBase'),
      irpp: t('payrollSlip.irpp'),
      css: t('payrollSlip.css'),
      net: t('payrollSlip.netSalary'),
    };
  }, [t]);

  const updateActiveRun = (patch: Partial<DraftRun>) => {
    if (!activeRun) return;
    const next = draftRuns.map(r => (r.id === activeRun.id ? ({ ...r, ...patch } as DraftRun) : r));
    setDraftRuns(next);
    saveDraftRuns(next);
  };

  const canConfirm = Boolean(activeRun && String(activeRun.status) === 'draft');
  const canMarkPaid = Boolean(activeRun && String(activeRun.status) === 'confirmed');

  const exportSelectedPdfs = async () => {
    if (!activeRun) return;
    const ids = Array.from(selectedUserIds);
    if (ids.length === 0) return;

    try {
      setIsExporting(true);
      toast({ title: t('payrollDraft.export.preparing') });

      for (const uid of ids) {
        const entry = activeRun.entries.find(e => e.userId === uid) as any;
        if (!entry?.breakdown) continue;
        const name = users.find(u => u.id === uid)?.name ?? entry.userName ?? `#${uid}`;
        const safe = String(name).replace(/[\\/:*?"<>|]+/g, '-').trim() || `employee-${uid}`;
        const fileName = `payslip-${safe}-${String(activeRun.month).padStart(2, '0')}-${activeRun.year}.pdf`;

        const doc = (
          <PaySlipPDF
            breakdown={entry.breakdown}
            month={activeRun.month}
            year={activeRun.year}
            employeeName={name}
            labels={pdfLabels}
          />
        );
        const blob = await pdf(doc as any).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }

      toast({ title: t('payrollDraft.export.done'), description: t('payrollDraft.export.doneHint', { count: ids.length }) });
    } catch (e) {
      toast({ title: t('payrollDraft.export.error'), description: String(e), variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const buildDraftRun = async (values: { month: number; year: number }) => {
    const month = Number(values.month);
    const year = Number(values.year);
    const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const end = start.endOf('month');

    // Ensure leaves are present for this month/year (best effort)
    const leaves = await (async () => {
      try {
        const perUser = await mapWithConcurrency(users, 5, async (u) => {
          const lvs = await schedulesApi.getLeaves(u.id);
          return lvs.map(l => ({ ...l, userId: u.id, userName: u.name })) as (UserLeave & { userId: number; userName: string })[];
        });
        return perUser.flat();
      } catch {
        return [] as any[];
      }
    })();

    const attendance = (attendanceQuery.data ?? []).filter((r: any) => {
      const d = dayjs(String(r.date));
      return d.isValid() && !d.isBefore(start, 'day') && !d.isAfter(end, 'day');
    });

    const attendanceByUser = new Map<number, any[]>();
    for (const r of attendance) {
      const uid = Number(r.userId);
      if (!attendanceByUser.has(uid)) attendanceByUser.set(uid, []);
      attendanceByUser.get(uid)!.push(r);
    }

    const leavesByUser = new Map<number, any[]>();
    for (const l of leaves) {
      const uid = Number((l as any).userId);
      if (!leavesByUser.has(uid)) leavesByUser.set(uid, []);
      leavesByUser.get(uid)!.push(l);
    }

    const entries: DraftRun['entries'] = users.map((u) => {
      const cfg = salaryByUserId.get(u.id) ?? null;
      const issues: string[] = [];
      if (!cfg || !Number.isFinite(Number(cfg.grossSalary))) issues.push(t('payrollDraft.issues.missingSalary'));

      const breakdown = cfg
        ? calculateTunisianNetSalary({
            grossSalary: Number(cfg.grossSalary || 0),
            isHeadOfFamily: Boolean(cfg.isHeadOfFamily),
            childrenCount: Number(cfg.childrenCount || 0),
            customDeductions: cfg.customDeductions,
          })
        : calculateTunisianNetSalary({ grossSalary: 0, isHeadOfFamily: false, childrenCount: 0 });

      const att = attendanceByUser.get(u.id) ?? [];
      const workedDays = att.filter((r: any) => String(r.status) === 'present' || String(r.status) === 'late' || String(r.status) === 'half_day').length;
      const totalHours = att.reduce((acc: number, r: any) => acc + Number(r.hoursWorked || 0), 0);
      const overtimeHours = att.reduce((acc: number, r: any) => acc + Number(r.overtimeHours || 0), 0);

      // leaveDays: count distinct days in month for approved leaves (rough frontend estimate)
      const lvs = (leavesByUser.get(u.id) ?? []).filter((l: any) => String(l.status) === 'approved');
      let leaveDays = 0;
      for (const l of lvs) {
        const ls = dayjs(String(l.startDate));
        const le = dayjs(String(l.endDate));
        if (!ls.isValid() || !le.isValid()) continue;
        const s = ls.isBefore(start, 'day') ? start : ls;
        const e = le.isAfter(end, 'day') ? end : le;
        const days = e.diff(s, 'day') + 1;
        leaveDays += Math.max(0, days);
      }

      const entry: PayrollEntry & { breakdown: SalaryBreakdown; issues?: string[] } = {
        id: Number(`${Date.now()}${u.id}`.slice(-12)),
        payrollRunId: Number(`${Date.now()}`.slice(-9)),
        userId: u.id,
        userName: u.name,
        grossSalary: Number(cfg?.grossSalary ?? 0),
        cnss: breakdown.cnss,
        taxableGross: breakdown.taxableGross,
        abattement: breakdown.abattement,
        taxableBase: breakdown.taxableBase,
        irpp: breakdown.irpp,
        css: breakdown.css,
        netSalary: breakdown.netSalary,
        workedDays,
        totalHours,
        overtimeHours,
        leaveDays,
        details: { irppBrackets: breakdown.irppBrackets },
        breakdown,
        issues: issues.length ? issues : undefined,
      };
      return entry;
    });

    const totals = entries.reduce(
      (acc, e) => {
        acc.totalGross += Number(e.grossSalary || 0);
        acc.totalNet += Number(e.netSalary || 0);
        acc.totalCnss += Number(e.cnss || 0);
        acc.totalIrpp += Number(e.irpp || 0);
        acc.totalCss += Number(e.css || 0);
        acc.missingSalary += (e as any).issues?.includes(t('payrollDraft.issues.missingSalary')) ? 1 : 0;
        return acc;
      },
      { totalGross: 0, totalNet: 0, totalCnss: 0, totalIrpp: 0, totalCss: 0, missingSalary: 0 }
    );

    const run: DraftRun = {
      kind: 'draft_local',
      id: Date.now(),
      month,
      year,
      status: 'draft',
      entries,
      totalGross: totals.totalGross,
      totalNet: totals.totalNet,
      createdBy: 0,
      createdAt: new Date().toISOString(),
    };

    const next = [run, ...draftRuns].slice(0, 24);
    setDraftRuns(next);
    saveDraftRuns(next);
    setActiveRunId(run.id);
    setSelectedUserIds(new Set());
  };

  return (
    <div className="flex flex-col">
      <HRPageHeader
        title={t('payroll')}
        subtitle={t('payrollPage.subtitle')}
        icon={Coins}
        backTo={{ to: '/dashboard/hr', label: t('dashboard') }}
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-2">
            <Wand2 className="h-4 w-4" />
            {t('payrollPage.generatePayroll')}
          </Button>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4">
        <Card className="shadow-card border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">{t('payrollPage.overviewTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('payrollPage.overviewHint')}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[11px]">
                  {t('payrollDraft.kpis.totalNet')}: {formatTnd(activeRun?.totalNet ?? 0)}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  {t('payrollDraft.kpis.totalCnss')}: {formatTnd(activeRun?.entries?.reduce((a, e) => a + Number(e.cnss || 0), 0) ?? 0)}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  {t('payrollDraft.kpis.totalIrpp')}: {formatTnd(activeRun?.entries?.reduce((a, e) => a + Number(e.irpp || 0), 0) ?? 0)}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  {t('payrollDraft.kpis.period')}: {String(periodMonth).padStart(2, '0')}/{periodYear}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  {t('payrollDraft.kpis.pendingLeaves')}: {monthStats.pendingLeaves}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card border-0 bg-card">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">{t('payrollPage.runsTitle')}</CardTitle>
              <Badge variant="secondary" className="text-[11px]">
                {draftRuns.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-3">
              <AlertDescription className="text-sm text-muted-foreground">
                {t('payrollDraft.runsHint')}
              </AlertDescription>
            </Alert>
            {draftRuns.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-sm font-medium">{t('payrollDraft.emptyTitle')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('payrollDraft.emptyHint')}</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('payrollPage.month')}</TableHead>
                    <TableHead>{t('payrollPage.status')}</TableHead>
                    <TableHead>{t('payrollPage.totalNet')}</TableHead>
                    <TableHead className="text-right">{t('payrollDraft.open')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draftRuns.map(r => (
                    <TableRow key={r.id} className={cn(activeRunId === r.id && 'bg-muted/30')}>
                      <TableCell>{r.month}/{r.year}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center rounded px-2 py-1 text-xs font-medium capitalize", statusBadgeClass(String(r.status)))}>
                          {String(r.status).replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell>{formatTnd(r.totalNet)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setActiveRunId(r.id)}>
                          {t('payrollDraft.open')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-card">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">{t('payrollDraft.entriesTitle')}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[11px]">
                  {activeRun?.entries?.length ?? 0}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  {t('payrollDraft.kpis.totalHours')}: {Number(monthStats.totalHours).toFixed(1)}h
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  {t('payrollDraft.kpis.totalOvertime')}: {Number(monthStats.totalOvertime).toFixed(1)}h
                </Badge>
                <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={!activeRun || selectedUserIds.size === 0 || isExporting}
                  onClick={exportSelectedPdfs}
                >
                  <FileDown className="h-4 w-4" />
                  {isExporting ? t('payrollDraft.export.exporting') : t('payrollDraft.export.button')}
                </Button>
                <Button
                  size="sm"
                  variant={canConfirm ? 'default' : 'outline'}
                  disabled={!canConfirm}
                  onClick={() => {
                    updateActiveRun({ status: 'confirmed', confirmedAt: new Date().toISOString() as any });
                    toast({ title: t('payrollDraft.actions.confirmed') });
                  }}
                >
                  {t('payrollDraft.actions.confirm')}
                </Button>
                <Button
                  size="sm"
                  variant={canMarkPaid ? 'default' : 'outline'}
                  disabled={!canMarkPaid}
                  onClick={() => {
                    updateActiveRun({ status: 'paid' });
                    toast({ title: t('payrollDraft.actions.paid') });
                  }}
                >
                  {t('payrollDraft.actions.markPaid')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!activeRun ? (
              <div className="py-10 text-center">
                <div className="text-sm font-medium">{t('payrollDraft.noActiveRunTitle')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('payrollDraft.noActiveRunHint')}</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={activeRun.entries.length > 0 && selectedUserIds.size === activeRun.entries.length}
                        onCheckedChange={(val) => {
                          const checked = Boolean(val);
                          setSelectedUserIds(checked ? new Set(activeRun.entries.map(e => e.userId)) : new Set());
                        }}
                        aria-label={t('payrollDraft.selectAll')}
                      />
                    </TableHead>
                    <TableHead>{t('employee.employee')}</TableHead>
                    <TableHead>{t('payrollDraft.gross')}</TableHead>
                    <TableHead>{t('payrollDraft.net')}</TableHead>
                    <TableHead>{t('payrollDraft.deductions')}</TableHead>
                    <TableHead>{t('payrollDraft.workedDays')}</TableHead>
                    <TableHead className="text-right">{t('payrollDraft.details')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRun.entries.map(e => {
                    const u = users.find(x => x.id === e.userId);
                    const hasIssues = (e as any).issues?.length;
                    const isSelected = selectedUserIds.has(e.userId);
                    return (
                      <TableRow key={e.userId}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(val) => {
                              const checked = Boolean(val);
                              setSelectedUserIds(prev => {
                                const next = new Set(prev);
                                if (checked) next.add(e.userId);
                                else next.delete(e.userId);
                                return next;
                              });
                            }}
                            aria-label={t('payrollDraft.selectEmployee')}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar src={u?.profilePictureUrl} name={e.userName} seed={e.userId} size="sm" />
                            <div className="min-w-0">
                              <div className="truncate">{e.userName}</div>
                              {u?.email ? <div className="truncate text-xs text-muted-foreground">{u.email}</div> : null}
                            </div>
                          </div>
                          {hasIssues ? (
                            <div className="mt-1 text-xs text-amber-700 dark:text-amber-200">
                              {(e as any).issues?.join(' • ')}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>{formatTnd(e.grossSalary)}</TableCell>
                        <TableCell className="font-semibold text-primary">{formatTnd(e.netSalary)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          CNSS {formatTnd(e.cnss)} · CSS {formatTnd(e.css)} · IRPP {formatTnd(e.irpp)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {t('payrollDraft.daysWorkedAndLeave', { worked: e.workedDays, leave: e.leaveDays })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              setActiveEntryUserId(e.userId);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            {t('payrollDraft.viewSlip')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <PayrollSettings />
      </div>

      <PayrollRunDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={async (values) => {
          await buildDraftRun(values);
        }}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t('payrollDraft.slipTitle')}</DialogTitle>
          </DialogHeader>
          {activeEntry ? (
            <PaySlipDetail breakdown={(activeEntry as any).breakdown} />
          ) : (
            <div className="text-sm text-muted-foreground">{t('payrollDraft.noSlip')}</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

