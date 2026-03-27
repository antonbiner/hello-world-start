import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import type { AttendanceSettings as Settings } from '../../types/hr.types';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Info, Sparkles, Wand2 } from 'lucide-react';

export function AttendanceSettings(props: {
  initial: Settings | null;
  onSave: (values: Partial<Settings>) => Promise<void> | void;
  isSaving?: boolean;
}) {
  const { t } = useTranslation('hr');
  const form = useForm<Partial<Settings>>({
    defaultValues: props.initial ?? {
      weekendDays: [5, 6],
      standardHoursPerDay: 8,
      overtimeThreshold: 8,
      overtimeMultiplier: 1.5,
      roundingMethod: 'none',
      calculationMethod: 'actual_hours',
      lateThresholdMinutes: 10,
      holidays: [],
    },
  });

  const v = form.watch();
  const weekendDays = (v.weekendDays ?? []).map(Number).filter(n => Number.isFinite(n));
  const toggleWeekendDay = (d: number) => {
    const set = new Set<number>(weekendDays);
    if (set.has(d)) set.delete(d);
    else set.add(d);
    form.setValue('weekendDays', Array.from(set).sort((a, b) => a - b));
  };

  const holidaysText = Array.isArray(v.holidays) ? v.holidays.join('\n') : '';

  return (
    <Card className="shadow-card border-0 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{t('attendancePage.settings')}</CardTitle>
          <Badge variant="secondary" className="text-[11px] inline-flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            {t('attendanceSettings.companyLevel')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription className="text-sm text-muted-foreground">
            {t('attendanceSettings.hint')}
          </AlertDescription>
        </Alert>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit(async (values) => props.onSave(values))}
        >
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {t('attendanceSettings.weekendDaysLabel')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 0, label: t('attendanceSettings.days.sun') },
                { id: 1, label: t('attendanceSettings.days.mon') },
                { id: 2, label: t('attendanceSettings.days.tue') },
                { id: 3, label: t('attendanceSettings.days.wed') },
                { id: 4, label: t('attendanceSettings.days.thu') },
                { id: 5, label: t('attendanceSettings.days.fri') },
                { id: 6, label: t('attendanceSettings.days.sat') },
              ].map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleWeekendDay(d.id)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    weekendDays.includes(d.id)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border/50 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('attendanceSettings.standardHoursPerDay')}</Label>
            <Input type="number" step="0.25" {...form.register('standardHoursPerDay', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>{t('attendanceSettings.overtimeThreshold')}</Label>
            <Input type="number" step="0.25" {...form.register('overtimeThreshold', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>{t('attendanceSettings.overtimeMultiplier')}</Label>
            <Input type="number" step="0.1" {...form.register('overtimeMultiplier', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>{t('attendanceSettings.lateThresholdMinutes')}</Label>
            <Input type="number" {...form.register('lateThresholdMinutes', { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              {t('attendanceSettings.roundingMethod')}
            </Label>
            <Select
              value={String(v.roundingMethod ?? 'none')}
              onValueChange={(val) => form.setValue('roundingMethod', val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('attendanceSettings.rounding.none')}</SelectItem>
                <SelectItem value="15min">{t('attendanceSettings.rounding.15min')}</SelectItem>
                <SelectItem value="30min">{t('attendanceSettings.rounding.30min')}</SelectItem>
                <SelectItem value="hour">{t('attendanceSettings.rounding.hour')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-muted-foreground" />
              {t('attendanceSettings.calculationMethod')}
            </Label>
            <Select
              value={String(v.calculationMethod ?? 'actual_hours')}
              onValueChange={(val) => form.setValue('calculationMethod', val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actual_hours">{t('attendanceSettings.calculation.actual_hours')}</SelectItem>
                <SelectItem value="standard_day">{t('attendanceSettings.calculation.standard_day')}</SelectItem>
                <SelectItem value="custom">{t('attendanceSettings.calculation.custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>{t('attendanceSettings.holidays')}</Label>
            <Textarea
              value={holidaysText}
              onChange={(e) => {
                const arr = e.target.value
                  .split('\n')
                  .map(s => s.trim())
                  .filter(Boolean);
                form.setValue('holidays', arr);
              }}
              placeholder={t('attendanceSettings.holidaysPlaceholder')}
              className="min-h-[120px]"
            />
            <div className="text-xs text-muted-foreground">
              {t('attendanceSettings.holidaysHint')}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={props.isSaving}>
              {t('save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

