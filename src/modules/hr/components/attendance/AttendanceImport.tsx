import { useTranslation } from 'react-i18next';
import { GenericImportModal } from '@/shared/import/GenericImportModal';
import type { ImportConfig } from '@/shared/import/types';
import type { AttendanceRecord } from '../../types/hr.types';
import type { BulkImportResult } from '@/shared/import/types';

export function AttendanceImport(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: Array<Partial<AttendanceRecord>>) => Promise<void> | void;
}) {
  const { t } = useTranslation('hr');

  const config: ImportConfig<Partial<AttendanceRecord>> = {
    entityName: t('attendancePage.importTitle'),
    requiredFields: ['userId', 'date'],
    duplicateCheckFields: ['userId', 'date'],
    templateFilename: 'attendance-import-template',
    templateSheetName: t('attendancePage.importTitle'),
    fields: [
      { key: 'userId', label: t('labels.employeeId'), required: true, type: 'number' },
      { key: 'date', label: t('attendanceFields.date'), required: true, type: 'date' },
      { key: 'checkIn', label: t('attendanceFields.checkIn'), required: false, type: 'string' },
      { key: 'checkOut', label: t('attendanceFields.checkOut'), required: false, type: 'string' },
      { key: 'breakDuration', label: t('attendanceFields.breakDuration'), required: false, type: 'number' },
      { key: 'notes', label: t('attendanceFields.notes'), required: false },
    ],
    exampleData: [
      { userId: 1, date: '2026-03-01', checkIn: '08:00', checkOut: '17:00', breakDuration: 60, notes: t('attendancePage.importExampleNote') } as any,
    ],
    transformRow: (mapped: Record<string, any>) => ({
      ...(mapped as any),
      source: 'import',
    }),
  };

  const handleImport = async (items: Partial<AttendanceRecord>[]): Promise<BulkImportResult> => {
    await props.onImport(items);
    return {
      totalProcessed: items.length,
      successCount: items.length,
      failedCount: 0,
      skippedCount: 0,
      errors: [],
    };
  };

  return (
    <GenericImportModal
      open={props.open}
      onOpenChange={props.onOpenChange}
      config={config}
      onImport={handleImport}
      translationNamespace="hr"
    />
  );
}
