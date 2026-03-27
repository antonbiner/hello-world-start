import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HRPageHeader } from '../HRPageHeader';
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { Network, Building2, Users, ChevronRight } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function OrgChartPage() {
  const { t } = useTranslation('hr');
  const { departmentsQuery } = useDepartments();
  const { employeesQuery } = useEmployees();

  const departments = departmentsQuery.data ?? [];
  const employees = employeesQuery.data ?? [];

  const departmentNamesFromEmployees = useMemo(() => {
    const set = new Set<string>();
    for (const e of employees) {
      const dept = (e?.salaryConfig?.department ?? '').trim();
      if (dept) set.add(dept);
    }
    return Array.from(set);
  }, [employees]);

  const employeesByDepartment = useMemo(() => {
    const map = new Map<string, Array<{ id: number; name: string; position?: string; profilePictureUrl?: string | null }>>();
    const unassigned: Array<{ id: number; name: string; position?: string; profilePictureUrl?: string | null }> = [];
    for (const e of employees) {
      const user = e?.user ?? {};
      const uid = Number(user.id);
      if (!Number.isFinite(uid)) continue;
      const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || `#${uid}`;
      const position = e?.salaryConfig?.position;
      const profilePictureUrl = user.profilePictureUrl ?? null;
      const dept = (e?.salaryConfig?.department ?? '').trim();
      if (!dept || dept === '—') {
        unassigned.push({ id: uid, name, position, profilePictureUrl });
      } else {
        if (!map.has(dept)) map.set(dept, []);
        map.get(dept)!.push({ id: uid, name, position, profilePictureUrl });
      }
    }
    if (unassigned.length > 0) map.set('Unassigned', unassigned);
    for (const d of departments) {
      if (!map.has(d.name)) map.set(d.name, []);
    }
    for (const n of departmentNamesFromEmployees) {
      if (!map.has(n)) map.set(n, []);
    }
    return map;
  }, [employees, departments, departmentNamesFromEmployees]);

  const chartEntries = useMemo(() => {
    return Array.from(employeesByDepartment.entries()).sort(([a], [b]) =>
      a === 'Unassigned' ? 1 : b === 'Unassigned' ? -1 : a.localeCompare(b)
    );
  }, [employeesByDepartment]);

  return (
    <div className="flex flex-col">
      <HRPageHeader
        title={t('departments.orgChartTitle')}
        subtitle={t('departments.orgChartSubtitle')}
        icon={Network}
        backTo={{ to: '/dashboard/hr/departments', label: t('departments.title') }}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/hr/departments">
              <Building2 className="h-4 w-4 mr-2" />
              {t('departments.manage')}
            </Link>
          </Button>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6">
        {departmentsQuery.isLoading || employeesQuery.isLoading ? (
          <Card className="shadow-card border-0 bg-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              {t('loading')}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {chartEntries.length === 0 ? (
              <Card className="shadow-card border-0 bg-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t('departments.orgChartEmpty')}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {chartEntries.map(([deptName, emps]) => (
                    <Card key={deptName} className="shadow-card border-0 bg-card overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            {deptName}
                          </CardTitle>
                          <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            {emps.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 max-h-[320px] overflow-y-auto">
                          {emps.map((emp) => (
                            <Link
                              key={emp.id}
                              to={`/dashboard/hr/employees/${emp.id}`}
                              className={cn(
                                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                                'hover:bg-muted/50'
                              )}
                            >
                              <UserAvatar name={emp.name} seed={emp.id} src={emp.profilePictureUrl} size="sm" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{emp.name}</div>
                                {emp.position && (
                                  <div className="text-xs text-muted-foreground truncate">{emp.position}</div>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
