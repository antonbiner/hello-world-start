import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarDays, StickyNote, UserRound } from 'lucide-react';

export type FormValues = {
  userId: number;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
};

export function LeaveRequestForm(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}) {
  const { t } = useTranslation('hr');
  const form = useForm<FormValues>({
    defaultValues: { userId: 0, type: 'annual', startDate: '', endDate: '', reason: '' },
  });

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('leavesPage.newRequest')}</DialogTitle>
        </DialogHeader>
        <Alert>
          <AlertDescription className="text-sm text-muted-foreground">
            {t('leavesPage.newRequestHint')}
          </AlertDescription>
        </Alert>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            await props.onSubmit(values);
            props.onOpenChange(false);
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                {t('employee.employee')}
              </Label>
              <Input type="number" {...form.register('userId', { valueAsNumber: true })} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                {t('leavesPage.type')}
              </Label>
              <Input {...form.register('type')} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {t('leavesPage.startDate')}
              </Label>
              <Input type="date" {...form.register('startDate')} />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {t('leavesPage.endDate')}
              </Label>
              <Input type="date" {...form.register('endDate')} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t('leavesPage.reason')}</Label>
            <Input {...form.register('reason')} />
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

