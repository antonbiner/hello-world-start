import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AttendanceRecord } from '../../types/hr.types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarDays, Clock, StickyNote } from 'lucide-react';

type FormValues = {
  userId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakDuration?: number;
  notes?: string;
};

export function AttendanceManualEntry(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUserId?: number;
  defaultDate?: string;
  onSubmit: (payload: Partial<AttendanceRecord>) => Promise<void> | void;
  isSubmitting?: boolean;
}) {
  const { t } = useTranslation('hr');
  const form = useForm<FormValues>({
    defaultValues: {
      userId: props.defaultUserId ?? 0,
      date: props.defaultDate ?? '',
      checkIn: '',
      checkOut: '',
      breakDuration: 0,
      notes: '',
    },
  });

  // Keep dialog inputs in sync with clicked cell
  useEffect(() => {
    if (!props.open) return;
    form.reset({
      userId: props.defaultUserId ?? 0,
      date: props.defaultDate ?? '',
      checkIn: '',
      checkOut: '',
      breakDuration: 0,
      notes: '',
    });
  }, [props.open, props.defaultUserId, props.defaultDate, form]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('attendancePage.manualEntry')}</DialogTitle>
        </DialogHeader>
        <Alert>
          <AlertDescription className="text-sm text-muted-foreground">
            {t('attendancePage.manualEntryHint')}
          </AlertDescription>
        </Alert>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            await props.onSubmit({
              userId: Number(values.userId),
              date: values.date,
              checkIn: values.checkIn || undefined,
              checkOut: values.checkOut || undefined,
              breakDuration: values.breakDuration ? Number(values.breakDuration) : undefined,
              notes: values.notes || undefined,
              source: 'manual',
              status: 'present',
            });
            props.onOpenChange(false);
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                {t('employee.employee')}
              </Label>
              <Input type="number" {...form.register('userId', { valueAsNumber: true })} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {t('attendanceFields.date')}
              </Label>
              <Input type="date" {...form.register('date')} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t('attendanceFields.checkIn')}
              </Label>
              <Input placeholder="08:00" {...form.register('checkIn')} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t('attendanceFields.checkOut')}
              </Label>
              <Input placeholder="17:00" {...form.register('checkOut')} />
            </div>
            <div className="grid gap-2">
              <Label>{t('attendanceFields.breakDuration')}</Label>
              <Input type="number" {...form.register('breakDuration', { valueAsNumber: true })} />
            </div>
            <div className="grid gap-2">
              <Label>{t('attendanceFields.notes')}</Label>
              <Input {...form.register('notes')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={props.isSubmitting}>
              {t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

