import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEmployees } from '../../hooks/useEmployees';
import { UserAvatar } from '@/components/ui/user-avatar';
import { formatTnd } from '../../utils/money';
import { HRPageHeader } from '../HRPageHeader';
import { CheckCircle2, CircleAlert, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchAndFilterBar } from '@/shared/components/SearchAndFilterBar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function EmployeeList() {
  const { t } = useTranslation('hr');
  const { employeesQuery } = useEmployees();
  const [q, setQ] = useState('');
  const [salaryFilter, setSalaryFilter] = useState<'all' | 'missing' | 'ready'>('all');

  const rows = employeesQuery.data ?? [];
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r: any) => {
      const name = `${r?.user?.firstName ?? ''} ${r?.user?.lastName ?? ''}`.trim().toLowerCase();
      const email = String(r?.user?.email ?? '').toLowerCase();
      const dept = String(r?.salaryConfig?.department ?? '').toLowerCase();
      return name.includes(s) || email.includes(s) || dept.includes(s);
    });
  }, [rows, q]);

  const salaryReadyCount = useMemo(() => {
    return rows.filter((r: any) => Number.isFinite(Number(r?.salaryConfig?.grossSalary))).length;
  }, [rows]);

  const salaryMissingCount = useMemo(() => {
    return rows.filter((r: any) => !Number.isFinite(Number(r?.salaryConfig?.grossSalary))).length;
  }, [rows]);

  const filteredBySalary = useMemo(() => {
    if (salaryFilter === 'all') return filtered;
    if (salaryFilter === 'ready') return filtered.filter((r: any) => Number.isFinite(Number(r?.salaryConfig?.grossSalary)));
    return filtered.filter((r: any) => !Number.isFinite(Number(r?.salaryConfig?.grossSalary)));
  }, [filtered, salaryFilter]);

  return (
    <div className="flex flex-col">
      <HRPageHeader
        title={t('employees')}
        subtitle={t('employeesPage.subtitle')}
        icon={Users}
        backTo={{ to: '/dashboard/hr', label: t('dashboard') }}
      />

      <div className="p-3 sm:p-4 lg:p-6">
        <Card className="shadow-card border-0 bg-card">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">{t('employees')}</CardTitle>
            <Badge variant="secondary" className="text-[11px]">
              {filteredBySalary.length} / {rows.length}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={salaryFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSalaryFilter('all')}
            >
              {t('employeesPage.filters.all')}
            </Button>
            <Button
              size="sm"
              variant={salaryFilter === 'missing' ? 'default' : 'outline'}
              onClick={() => setSalaryFilter('missing')}
              className="gap-2"
            >
              <CircleAlert className="h-4 w-4" />
              {t('employeesPage.filters.missingSalary')}
              <Badge variant="secondary" className={cn('ml-1 text-[11px]', salaryFilter === 'missing' ? 'bg-background/30' : '')}>
                {salaryMissingCount}
              </Badge>
            </Button>
            <Button
              size="sm"
              variant={salaryFilter === 'ready' ? 'default' : 'outline'}
              onClick={() => setSalaryFilter('ready')}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('employeesPage.filters.payrollReady')}
              <Badge variant="secondary" className={cn('ml-1 text-[11px]', salaryFilter === 'ready' ? 'bg-background/30' : '')}>
                {salaryReadyCount}
              </Badge>
            </Button>
          </div>
          <SearchAndFilterBar
            searchTerm={q}
            onSearchChange={setQ}
            placeholder={t('common.searchPlaceholder')}
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
        </CardHeader>
        <CardContent>
          {employeesQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">{t('loading')}</div>
          ) : employeesQuery.error ? (
            <div className="text-sm text-destructive">{String(employeesQuery.error)}</div>
          ) : filteredBySalary.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-sm font-medium">{t('employeesPage.emptyTitle')}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('employeesPage.emptyHint')}</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('employee.name')}</TableHead>
                  <TableHead>{t('employee.department')}</TableHead>
                  <TableHead>{t('employee.position')}</TableHead>
                  <TableHead>{t('employee.grossSalary')}</TableHead>
                  <TableHead>{t('employee.employmentType')}</TableHead>
                  <TableHead>{t('employeesPage.payrollStatus')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBySalary.map((r: any) => {
                  const user = r.user ?? {};
                  const cfg = r.salaryConfig ?? null;
                  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || `#${user.id}`;
                  const salaryReady = Number.isFinite(Number(cfg?.grossSalary));
                  return (
                    <TableRow key={user.id} to={`/dashboard/hr/employees/${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar
                            src={user.profilePictureUrl}
                            name={name}
                            seed={user.id}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="truncate font-medium">{name}</div>
                            <div className="truncate text-xs text-muted-foreground">{user.email ?? '—'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cfg?.department ?? '—'}</TableCell>
                      <TableCell>{cfg?.position ?? '—'}</TableCell>
                      <TableCell>{cfg?.grossSalary != null ? formatTnd(cfg.grossSalary) : '—'}</TableCell>
                      <TableCell className="capitalize">{(cfg?.employmentType ?? '—').replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded px-2 py-1 text-xs font-medium',
                            salaryReady ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200' : 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
                          )}
                        >
                          {salaryReady ? t('employeesPage.payrollReady') : t('employeesPage.missingSalary')}
                        </span>
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
    </div>
  );
}

