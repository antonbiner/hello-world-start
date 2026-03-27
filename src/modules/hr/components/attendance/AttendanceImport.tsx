import { useTranslation } from 'react-i18next';
import { GenericImportModal } from '@/shared/import/GenericImportModal';
import type { ImportConfig } from '@/shared/import/types';
import type { AttendanceRecord } from '../../types/hr.types';

export function AttendanceImport(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: Array<Partial<AttendanceRecord>>) => Promise<void> | void;
}) {
  const { t } = useTranslation('hr');

  const config: ImportConfig<Partial<AttendanceRecord>> = {
    entityName: t('attendancePage.importTitle'),
    entityNamePlural: t('attendancePage.importTitle'),
    name: 'attendance',
    fields: [
      { key: 'userId', label: t('labels.employeeId'), required: true, type: 'number' },
      { key: 'date', label: t('attendanceFields.date'), required: true, type: 'date' },
      { key: 'checkIn', label: t('attendanceFields.checkIn'), required: false, type: 'time' },
      { key: 'checkOut', label: t('attendanceFields.checkOut'), required: false, type: 'time' },
      { key: 'breakDuration', label: t('attendanceFields.breakDuration'), required: false, type: 'number' },
      { key: 'notes', label: t('attendanceFields.notes'), required: false },
    ],
    exampleData: [
      { userId: 1, date: '2026-03-01', checkIn: '08:00', checkOut: '17:00', breakDuration: 60, notes: t('attendancePage.importExampleNote') } as any,
    ],
    columns: [
      { key: 'userId', label: t('labels.employeeId'), required: true },
      { key: 'date', label: t('attendanceFields.date'), required: true, type: 'date' },
      { key: 'checkIn', label: t('attendanceFields.checkIn'), required: false, type: 'time' },
      { key: 'checkOut', label: t('attendanceFields.checkOut'), required: false, type: 'time' },
    ],
    transformRow: (row: any, mapped: any) => ({
      ...(mapped as any),
      source: 'import',
      rawData: row,
    }),
  };

  return (
    <GenericImportModal
      open={props.open}
      onOpenChange={props.onOpenChange}
      config={config}
      onImport={props.onImport}
      translationNamespace="hr"
    />
  );
}

