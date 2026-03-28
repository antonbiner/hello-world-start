import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployees } from '../../hooks/useEmployees';
import { SalaryConfigForm, type SalaryConfigFormValues } from './SalaryConfigForm';
import { EmployeeEditForm, type EmployeeEditFormValues } from './EmployeeEditForm';
import { useToast } from '@/hooks/use-toast';
import { HRPageHeader } from '../HRPageHeader';
import { Badge } from '@/components/ui/badge';
import { Building2, BriefcaseBusiness, User } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import { usePlanningLeaves, usePlanningSchedule } from '../../hooks/usePlanning';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { UserLeave } from '@/services/api/schedulesApi';
import { useAttendance } from '../../hooks/useAttendance';
import { UnifiedDocumentsSection } from '@/modules/shared/components/documents/UnifiedDocumentsSection';

export function EmployeeDetail() {
  const { id } = useParams();
  const userId = Number(id);
  const { t } = useTranslation('hr');
  const { toast } = useToast();
  const { employeesQuery, upsertSalaryConfig, updateUser } = useEmployees();
  const scheduleQuery = usePlanningSchedule(userId);
  const planningLeavesQuery = usePlanningLeaves(userId);
  const now = new Date();
  const { attendanceQuery } = useAttendance({ month: now.getMonth() + 1, year: now.getFullYear() });

  const employee = useMemo(() => {
    const source = employeesQuery.data as any;
    const rows = Array.isArray(source) ? source : (source?.data && Array.isArray(source.data) ? source.data : []);
    return rows.find((r: any) => Number(r?.user?.id) === userId) ?? null;
  }, [employeesQuery.data, userId]);

  const user = employee?.user ?? null;
  const cfg = employee?.salaryConfig ?? null;
  const name = user ? (`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || `#${user.id}`) : `#${userId}`;

  const handleSave = async (values: SalaryConfigFormValues) => {
    await upsertSalaryConfig.mutateAsync({ userId, payload: values as any });
    toast({ title: t('employee.salaryConfigSaved') });
  };

  const handleSaveProfile = async (values: EmployeeEditFormValues) => {
    const hrPayload = {
      department: values.department || undefined,
      position: values.position || undefined,
      employmentType: values.employmentType,
      hireDate: values.hireDate || undefined,
      grossSalary: values.grossSalary,
      customDeductions: values.customDeductions,
      cnssNumber: values.cnssNumber || undefined,
      bankAccount: values.bankAccount || undefined,
      isHeadOfFamily: values.isHeadOfFamily,
      childrenCount: values.childrenCount,
      cin: values.cin || undefined,
      birthDate: values.birthDate || undefined,
      maritalStatus: values.maritalStatus,
      addressLine1: values.addressLine1 || undefined,
      addressLine2: values.addressLine2 || undefined,
      city: values.city || undefined,
      postalCode: values.postalCode || undefined,
      emergencyContactName: values.emergencyContactName || undefined,
      emergencyContactPhone: values.emergencyContactPhone || undefined,
    };

    let userOk = false;
    try {
      await updateUser.mutateAsync({
        userId,
        payload: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber || undefined,
        },
      });
      userOk = true;
    } catch {
      toast({ title: t('employeeEdit.userUpdateError'), variant: 'destructive' });
    }

    try {
      await upsertSalaryConfig.mutateAsync({ userId, payload: hrPayload });
      toast({ title: userOk ? t('employeeEdit.saved') : t('employeeEdit.hrSavedOnly') });
    } catch {
      toast({ title: t('employeeEdit.hrUpdateError'), variant: 'destructive' });
      if (!userOk) throw new Error('Save failed');
    }
  };

  const pendingLeavesCount = useMemo(() => {
    const source = planningLeavesQuery.data as any;
    const list = Array.isArray(source) ? source : (source?.data && Array.isArray(source.data) ? source.data : []);
    return list.filter((l: any) => String(l.status) === 'pending').length;
  }, [planningLeavesQuery.data]);

  const monthAttendanceSummary = useMemo(() => {
    const source = attendanceQuery.data as any;
    const records = Array.isArray(source) ? source : (source?.data && Array.isArray(source.data) ? source.data : []);
    const mine = records.filter((r: any) => r.userId === userId);
    const present = mine.filter((r: any) => r.status === 'present').length;
    const late = mine.filter((r: any) => r.status === 'late').length;
    const absent = mine.filter(r => r.status === 'absent').length;
    const leave = mine.filter(r => r.status === 'leave').length;
    return { total: mine.length, present, late, absent, leave };
  }, [attendanceQuery.data, userId]);

  const scheduleDays = useMemo(() => {
    const daySchedules = scheduleQuery.data?.daySchedules ?? {};
    const days = [
      { id: 1, label: t('attendanceSettings.days.mon') },
      { id: 2, label: t('attendanceSettings.days.tue') },
      { id: 3, label: t('attendanceSettings.days.wed') },
      { id: 4, label: t('attendanceSettings.days.thu') },
      { id: 5, label: t('attendanceSettings.days.fri') },
      { id: 6, label: t('attendanceSettings.days.sat') },
      { id: 0, label: t('attendanceSettings.days.sun') },
    ];
    return days.map(d => ({ ...d, s: (daySchedules as any)[d.id] ?? null }));
  }, [scheduleQuery.data?.daySchedules, t]);

  const formatLeaveRange = (l: UserLeave) => {
    const s = String(l.startDate);
    const e = String(l.endDate);
    return s === e ? s : `${s} → ${e}`;
  };

  const lastDraftPayroll = useMemo(() => {
    try {
      const raw = localStorage.getItem('hr_payroll_draft_runs_v1');
      const list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return null;
      for (const run of list) {
        const entry = run?.entries?.find((e: any) => Number(e?.userId) === userId);
        if (entry) {
          return {
            month: Number(run.month),
            year: Number(run.year),
            netSalary: Number(entry.netSalary || 0),
            status: String(run.status || 'draft'),
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }, [userId]);

  return (
    <div className="flex flex-col">
      <HRPageHeader
        title={name}
        subtitle={t('employee.employee')}
        icon={User}
        backTo={{ to: '/dashboard/hr/employees', label: t('employees') }}
        actions={
          user ? (
            <div className="hidden sm:flex items-center gap-2">
              <UserAvatar src={user.profilePictureUrl} name={name} seed={user.id} size="sm" />
            </div>
          ) : null
        }
      />

      <div className="p-3 sm:p-4 lg:p-6">
        <Card className="shadow-card border-0 bg-card">
          <CardContent className="p-4">
            {employeesQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">{t('loading')}</div>
            ) : !user ? (
              <div className="text-sm text-muted-foreground">{t('labels.employeeNotFound')}</div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar src={user.profilePictureUrl} name={name} seed={user.id} size="md" />
                  <div className="min-w-0">
                    <div className="text-base font-semibold truncate">{name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email ?? '—'}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {cfg?.department ?? '—'}
                  </Badge>
                  <Badge variant="secondary" className="gap-1.5">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {cfg?.position ?? '—'}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {(cfg?.employmentType ?? '—').replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full space-y-4 mt-4">
        <TabsList className={cn(
          "w-full h-auto p-1 bg-muted/50 rounded-lg grid gap-1",
          "grid-cols-2 sm:grid-cols-5"
        )}>
          <TabsTrigger value="overview" className="px-4 py-2.5 text-sm font-medium">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="profile" className="px-4 py-2.5 text-sm font-medium">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="schedule" className="px-4 py-2.5 text-sm font-medium">{t('tabs.schedule')}</TabsTrigger>
          <TabsTrigger value="leaves" className="px-4 py-2.5 text-sm font-medium">{t('leaves')}</TabsTrigger>
          <TabsTrigger value="salary" className="px-4 py-2.5 text-sm font-medium">{t('tabs.salary')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-3 space-y-3">
          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t('employeeDetail.overviewTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">{t('employeeDetail.kpis.attendance')}</div>
                  <div className="text-lg font-semibold mt-1">
                    {attendanceQuery.isLoading ? '—' : String(monthAttendanceSummary.present)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('employeeDetail.metrics.attendanceHint', {
                      present: monthAttendanceSummary.present,
                      late: monthAttendanceSummary.late,
                      absent: monthAttendanceSummary.absent,
                      leave: monthAttendanceSummary.leave,
                    })}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">{t('employeeDetail.kpis.leaves')}</div>
                  <div className="text-lg font-semibold mt-1">
                    {planningLeavesQuery.isLoading ? '—' : String(pendingLeavesCount)}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('employeeDetail.kpis.pending')}</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">{t('employeeDetail.kpis.payrollDraft')}</div>
                  <div className="text-lg font-semibold mt-1">
                    {lastDraftPayroll ? `${String(lastDraftPayroll.month).padStart(2, '0')}/${lastDraftPayroll.year}` : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lastDraftPayroll
                      ? t('employeeDetail.kpis.payrollDraftHint', { net: lastDraftPayroll.netSalary.toFixed(3), status: lastDraftPayroll.status })
                      : t('employeeDetail.kpis.noPayrollDraft')}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm text-muted-foreground">
                  {t('employeeDetail.overviewHint')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {user ? (
            <Card className="shadow-card border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-base">{t('employeeDetail.documentsTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <UnifiedDocumentsSection
                  entityType="user"
                  entityId={user.id}
                  moduleType="hr"
                  moduleName="HR"
                />
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="profile" className="mt-3 space-y-3">
          {employeesQuery.isLoading ? (
            <Card className="shadow-card border-0 bg-card">
              <CardContent className="py-8 text-center text-muted-foreground">{t('loading')}</CardContent>
            </Card>
          ) : !user ? (
            <Card className="shadow-card border-0 bg-card">
              <CardContent className="py-8 text-center text-muted-foreground">{t('labels.employeeNotFound')}</CardContent>
            </Card>
          ) : (
            <EmployeeEditForm
              user={user}
              salaryConfig={cfg}
              onSubmit={handleSaveProfile}
              isSubmitting={updateUser.isPending || upsertSalaryConfig.isPending}
            />
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-3">
          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t('tabs.schedule')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduleQuery.isLoading ? (
                <div className="text-sm text-muted-foreground">{t('loading')}</div>
              ) : scheduleQuery.error ? (
                <div className="text-sm text-destructive">{String(scheduleQuery.error)}</div>
              ) : (
                <>
                  <Alert>
                    <AlertDescription className="text-sm text-muted-foreground">
                      {t('employeeDetail.scheduleHint')}
                    </AlertDescription>
                  </Alert>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('employeeDetail.day')}</TableHead>
                        <TableHead>{t('employeeDetail.workingHours')}</TableHead>
                        <TableHead>{t('employeeDetail.lunch')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduleDays.map(d => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.label}</TableCell>
                          <TableCell>
                            {d.s?.enabled ? `${d.s.startTime}–${d.s.endTime}` : t('employeeDetail.off')}
                          </TableCell>
                          <TableCell>
                            {d.s?.enabled && d.s?.lunchStart && d.s?.lunchEnd ? `${d.s.lunchStart}–${d.s.lunchEnd}` : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="mt-3">
          <Card className="shadow-card border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t('leaves')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {planningLeavesQuery.isLoading ? (
                <div className="text-sm text-muted-foreground">{t('loading')}</div>
              ) : planningLeavesQuery.error ? (
                <div className="text-sm text-destructive">{String(planningLeavesQuery.error)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('leavesPage.type')}</TableHead>
                      <TableHead>{t('leavesPage.dates')}</TableHead>
                      <TableHead>{t('leavesPage.status')}</TableHead>
                      <TableHead>{t('leavesPage.reason')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(planningLeavesQuery.data ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground">
                          {t('employeeDetail.noLeaves')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      (planningLeavesQuery.data ?? []).map(l => (
                        <TableRow key={l.id}>
                          <TableCell className="capitalize">{t(`leaveType.${String(l.leaveType)}`, { defaultValue: String(l.leaveType).replace(/_/g, ' ') })}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatLeaveRange(l)}</TableCell>
                          <TableCell className="capitalize">{t(`leaveStatus.${String(l.status)}`, { defaultValue: String(l.status) })}</TableCell>
                          <TableCell className="max-w-[320px] truncate">{l.reason ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="mt-3">
          <SalaryConfigForm
            initial={cfg}
            isSubmitting={upsertSalaryConfig.isPending}
            onSubmit={handleSave}
          />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

