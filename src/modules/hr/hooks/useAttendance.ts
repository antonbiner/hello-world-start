import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AttendanceRecord, AttendanceSettings } from '../types/hr.types';
import { hrApi } from '../services/hrApi';

export function useAttendance(params: { month: number; year: number; userId?: number }) {
  const qc = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ['hr', 'attendance', params],
    queryFn: () => hrApi.getAttendance(params),
  });

  const createAttendance = useMutation({
    mutationFn: (payload: Partial<AttendanceRecord>) => hrApi.createAttendance(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'attendance'] }),
  });

  const updateAttendance = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AttendanceRecord> }) => hrApi.updateAttendance(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'attendance'] }),
  });

  const importAttendance = useMutation({
    mutationFn: (rows: Array<Partial<AttendanceRecord>>) => hrApi.importAttendance(rows),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'attendance'] }),
  });

  const attendanceSettingsQuery = useQuery({
    queryKey: ['hr', 'attendanceSettings'],
    queryFn: () => hrApi.getAttendanceSettings(),
  });

  const updateAttendanceSettings = useMutation({
    mutationFn: (payload: Partial<AttendanceSettings>) => hrApi.updateAttendanceSettings(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'attendanceSettings'] }),
  });

  return {
    attendanceQuery,
    createAttendance,
    updateAttendance,
    importAttendance,
    attendanceSettingsQuery,
    updateAttendanceSettings,
  };
}

