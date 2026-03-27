import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarDays, Coins, ClipboardList, ArrowRight, Sparkles, ShieldCheck, Timer, AlertTriangle, FileText } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { HRPageHeader } from './HRPageHeader';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { schedulesApi, type UserLeave } from '@/services/api/schedulesApi';
import dayjs from 'dayjs';
import { useAttendance } from '../hooks/useAttendance';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserAvatar } from '@/components/ui/user-avatar';

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

export function HRDashboard() {
  const { t } = useTranslation('hr');
  const { employeesQuery } = useEmployees();
  const now = dayjs();
  const { attendanceQuery } = useAttendance({ month: now.month() + 1, year: now.year() });

  const headcount = employeesQuery.data?.length ?? 0;
  const userRefs = useMemo(() => {
    const rows = employeesQuery.data ?? [];
    return rows
      .map((r: any) => r.user)
      .filter(Boolean)
      .map((u: any) => ({
        id: Number(u.id),
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || `#${u.id}`,
        profilePictureUrl: u.profilePictureUrl ?? null,
      }))
      .filter((u: any) => Number.isFinite(u.id) && u.id > 0);
  }, [employeesQuery.data]);

  const userById = useMemo(() => {
    const map = new Map<number, { name: string; profilePictureUrl?: string | null }>();
    for (const u of userRefs) map.set(Number(u.id), { name: u.name, profilePictureUrl: u.profilePictureUrl });
    return map;
  }, [userRefs]);

  const leavesQuery = useQuery({
    queryKey: ['hr', 'dashboardPlanningLeaves', userRefs.map(u => u.id)],
    enabled: userRefs.length > 0,
    queryFn: async () => {
      const perUser = await mapWithConcurrency(userRefs.map(u => u.id), 5, async (userId) => {
        return schedulesApi.getLeaves(userId);
      });
      return perUser.flat() as UserLeave[];
    },
  });

  const today = dayjs().format('YYYY-MM-DD');
  const pendingLeaves = useMemo(() => {
    const list = leavesQuery.data ?? [];
    return list.filter(l => String(l.status) === 'pending').length;
  }, [leavesQuery.data]);

  const outToday = useMemo(() => {
    const list = leavesQuery.data ?? [];
    return list.filter(l => {
      const status = String(l.status);
      if (status !== 'approved') return false;
      const s = dayjs(String(l.startDate)).format('YYYY-MM-DD');
      const e = dayjs(String(l.endDate)).format('YYYY-MM-DD');
      return s <= today && today <= e;
    }).length;
  }, [leavesQuery.data, today]);

  const recentLeaveActivity = useMemo(() => {
    const list = leavesQuery.data ?? [];
    const sorted = [...list].sort((a, b) => (String(a.startDate) > String(b.startDate) ? -1 : 1));
    return sorted.slice(0, 6);
  }, [leavesQuery.data]);

  const recentAttendanceActivity = useMemo(() => {
    const list = attendanceQuery.data ?? [];
    const sorted = [...list].sort((a: any, b: any) => (String(a.date) > String(b.date) ? -1 : 1));
    return sorted.slice(0, 6);
  }, [attendanceQuery.data]);

  const monthStats = useMemo(() => {
    const attendance = attendanceQuery.data ?? [];
    const totalOvertime = attendance.reduce((acc: number, r: any) => acc + Number(r.overtimeHours || 0), 0);
    return { totalOvertime };
  }, [attendanceQuery.data]);

  const payrollReadiness = useMemo(() => {
    const rows = employeesQuery.data ?? [];
    const missingSalaryUsers = rows
      .filter((r: any) => !r?.salaryConfig || !Number.isFinite(Number(r?.salaryConfig?.grossSalary)))
      .map((r: any) => r.user)
      .filter(Boolean);

    return {
      missingSalaryCount: missingSalaryUsers.length,
      sampleUsers: missingSalaryUsers.slice(0, 4),
    };
  }, [employeesQuery.data]);

  const attendanceOps = useMemo(() => {
    const rows = attendanceQuery.data ?? [];
    const missingCheckout = new Map<number, { userId: number; date: string }>();
    let overtimeRecords = 0;

    for (const r of rows as any[]) {
      const uid = Number(r.userId);
      if (!Number.isFinite(uid)) continue;
      if (r.checkIn && !r.checkOut) {
        const prev = missingCheckout.get(uid);
        if (!prev || String(r.date) > String(prev.date)) missingCheckout.set(uid, { userId: uid, date: String(r.date) });
      }
      if (Number(r.overtimeHours || 0) > 0) overtimeRecords += 1;
    }

    return {
      missingCheckoutUsers: Array.from(missingCheckout.values()),
      missingCheckoutCount: missingCheckout.size,
      overtimeRecords,
    };
  }, [attendanceQuery.data]);

  return (
    <div className="flex flex-col">
      <HRPageHeader
        title={t('title')}
        subtitle={t('header.subtitle')}
        icon={Users}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/hr/employees" className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('employees')}
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/hr/attendance" className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {t('attendance')}
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/hr/leaves" className="inline-flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                {t('leaves')}
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/hr/payroll" className="inline-flex items-center gap-2">
                <Coins className="h-4 w-4" />
                {t('payroll')}
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            </Button>
          </div>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="shadow-card border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.headcount')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{headcount}</div>
            <div className="text-xs text-muted-foreground mt-1">{t('dashboardPage.headcountHint')}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.absentToday')}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leavesQuery.isLoading ? '—' : outToday}</div>
            <div className="text-xs text-muted-foreground mt-1">{t('dashboardPage.absentTodayHint')}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.pendingLeaves')}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leavesQuery.isLoading ? '—' : pendingLeaves}</div>
            <div className="text-xs text-muted-foreground mt-1">{t('dashboardPage.pendingLeavesHint')}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.payrollTotal')}</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <div className="text-xs text-muted-foreground mt-1">{t('dashboardPage.payrollTotalHint')}</div>
          </CardContent>
        </Card>
      </div>

        <div className="grid gap-4 lg:grid-cols-3 mt-4">
          <Card className="shadow-card border-0 bg-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{t('dashboardPage.insightsTitle')}</CardTitle>
                <Badge variant="secondary" className="text-[11px] inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('dashboardPage.preview')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {t('dashboardPage.complianceTitle')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('dashboardPage.complianceHint')}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Timer className="h-4 w-4 text-primary" />
                    {t('dashboardPage.attendanceQualityTitle')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('dashboardPage.attendanceQualityHint')}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {t('dashboardPage.insightsFootnote')}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t('dashboardPage.quickStartTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-between">
                <Link to="/dashboard/hr/attendance">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {t('dashboardPage.quickStartAttendance')}
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-70" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-between">
                <Link to="/dashboard/hr/leaves">
                  <span className="inline-flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    {t('dashboardPage.quickStartLeaves')}
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-70" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-between">
                <Link to="/dashboard/hr/payroll">
                  <span className="inline-flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    {t('dashboardPage.quickStartPayroll')}
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-70" />
                </Link>
              </Button>
              <div className="text-xs text-muted-foreground pt-2">
                {t('dashboardPage.quickStartHint')}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 mt-4">
          <Card className="shadow-card border-0 bg-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{t('dashboardOps.title')}</CardTitle>
                <Badge variant="secondary" className="text-[11px] inline-flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {t('dashboardOps.badge')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">{t('dashboardOps.payrollReadiness')}</div>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {payrollReadiness.missingSalaryCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('dashboardOps.missingSalary')}
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">{t('dashboardOps.attendanceQuality')}</div>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {attendanceOps.missingCheckoutCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('dashboardOps.missingCheckout')}
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">{t('dashboardOps.overtime')}</div>
                    <Badge variant="secondary" className="text-[11px]">
                      {Number(monthStats.totalOvertime).toFixed(1)}h
                    </Badge>
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {attendanceOps.overtimeRecords}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('dashboardOps.overtimeRecords')}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">{t('dashboardOps.needsAttention')}</div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/dashboard/hr/employees">{t('dashboardOps.openEmployees')}</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/dashboard/hr/attendance">{t('dashboardOps.openAttendance')}</Link>
                  </Button>
                </div>
              </div>

              {payrollReadiness.sampleUsers.length === 0 && attendanceOps.missingCheckoutUsers.length === 0 ? (
                <Alert>
                  <AlertDescription className="text-sm text-muted-foreground">
                    {t('dashboardOps.allGood')}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{t('dashboardOps.missingSalaryTitle')}</div>
                      <Badge variant="secondary" className="text-[11px]">{payrollReadiness.missingSalaryCount}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {payrollReadiness.sampleUsers.map((u: any) => {
                        const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || `#${u.id}`;
                        return (
                          <Link key={u.id} to={`/dashboard/hr/employees/${u.id}`} className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs hover:bg-muted/40">
                            <UserAvatar src={u.profilePictureUrl} name={name} seed={u.id} size="xs" />
                            <span className="max-w-[180px] truncate">{name}</span>
                          </Link>
                        );
                      })}
                      {payrollReadiness.missingSalaryCount > payrollReadiness.sampleUsers.length ? (
                        <span className="text-xs text-muted-foreground">
                          {t('dashboardOps.andMore', { count: payrollReadiness.missingSalaryCount - payrollReadiness.sampleUsers.length })}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{t('dashboardOps.missingCheckoutTitle')}</div>
                      <Badge variant="secondary" className="text-[11px]">{attendanceOps.missingCheckoutCount}</Badge>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {attendanceOps.missingCheckoutUsers.slice(0, 4).map((x) => (
                        <div key={x.userId} className="flex items-center justify-between gap-2 text-xs">
                          {(() => {
                            const u = userById.get(Number(x.userId));
                            const nm = u?.name ?? `#${x.userId}`;
                            return (
                              <div className="flex items-center gap-2 min-w-0">
                                <UserAvatar src={u?.profilePictureUrl ?? null} name={nm} seed={Number(x.userId)} size="xs" />
                                <span className="truncate text-muted-foreground">{nm}</span>
                              </div>
                            );
                          })()}
                          <span className="font-medium whitespace-nowrap">{x.date}</span>
                        </div>
                      ))}
                      {attendanceOps.missingCheckoutCount > 4 ? (
                        <div className="text-xs text-muted-foreground">
                          {t('dashboardOps.andMore', { count: attendanceOps.missingCheckoutCount - 4 })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t('dashboardOps.recommended')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">{t('dashboardOps.recommendedHint')}</div>
              <div className="grid gap-2">
                <Button asChild variant="outline" size="sm" className="w-full justify-between">
                  <Link to="/dashboard/hr/employees">
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t('dashboardOps.recommendedSalary')}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-between">
                  <Link to="/dashboard/hr/attendance">
                    <span className="inline-flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      {t('dashboardOps.recommendedAttendance')}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-between">
                  <Link to="/dashboard/hr/payroll">
                    <span className="inline-flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      {t('dashboardOps.recommendedPayroll')}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 mt-4">
          <Card className="shadow-card border-0 bg-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{t('dashboardPage.activityTitle')}</CardTitle>
                <Badge variant="secondary" className="text-[11px]">
                  {t('dashboardPage.activityBadge')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(leavesQuery.isLoading || attendanceQuery.isLoading) ? (
                <div className="text-sm text-muted-foreground">{t('loading')}</div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{t('dashboardPage.activityAttendance')}</div>
                      <Badge variant="secondary" className="text-[11px]">
                        {(attendanceQuery.data ?? []).length}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {recentAttendanceActivity.length === 0 ? (
                        <div className="text-xs text-muted-foreground">{t('dashboardPage.activityEmptyAttendance')}</div>
                      ) : (
                        recentAttendanceActivity.map((r: any) => (
                          <div key={r.id} className="flex items-center justify-between text-xs">
                            <div className="truncate">
                              <span className="font-medium">{r.date}</span> · {t(`attendanceStatus.${r.status}`)}
                            </div>
                            <div className="text-muted-foreground">{r.hoursWorked ?? '—'}h</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{t('dashboardPage.activityLeaves')}</div>
                      <Badge variant="secondary" className="text-[11px]">
                        {(leavesQuery.data ?? []).length}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {recentLeaveActivity.length === 0 ? (
                        <div className="text-xs text-muted-foreground">{t('dashboardPage.activityEmptyLeaves')}</div>
                      ) : (
                        recentLeaveActivity.map((l: any, idx: number) => (
                          <div key={`${l.id}-${idx}`} className="flex items-center justify-between text-xs">
                            <div className="truncate">
                              <span className="font-medium">{l.startDate}</span> · {t(`leaveStatus.${String(l.status)}`, { defaultValue: String(l.status) })}
                            </div>
                            <div className="text-muted-foreground">{t(`leaveType.${String(l.leaveType)}`, { defaultValue: String(l.leaveType).replace(/_/g, ' ') })}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Alert>
                <AlertDescription className="text-sm text-muted-foreground">
                  {t('dashboardPage.activityHint')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t('dashboardPage.nextStepsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">{t('dashboardPage.nextStepsHint')}</div>
              <div className="grid gap-2">
                <Button asChild variant="outline" size="sm" className="w-full justify-between">
                  <Link to="/dashboard/hr/attendance">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {t('dashboardPage.nextStepsAttendance')}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-between">
                  <Link to="/dashboard/hr/leaves">
                    <span className="inline-flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      {t('dashboardPage.nextStepsLeaves')}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-between">
                  <Link to="/dashboard/hr/payroll">
                    <span className="inline-flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      {t('dashboardPage.nextStepsPayroll')}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

