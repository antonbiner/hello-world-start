import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '../services/hrApi';
import { usersApi } from '@/services/api/usersApi';
import type { UpdateUserRequest } from '@/types/users';
import type { EmployeeSalaryConfig } from '../types/hr.types';

export function useEmployees() {
  const qc = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: () => hrApi.getEmployees(),
  });

  const upsertSalaryConfig = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: Partial<EmployeeSalaryConfig> }) =>
      hrApi.upsertSalaryConfig(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'employees'] });
      qc.invalidateQueries({ queryKey: ['hr', 'employee'] });
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateUserRequest }) =>
      usersApi.update(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'employees'] });
      qc.invalidateQueries({ queryKey: ['hr', 'employee'] });
    },
  });

  return { employeesQuery, upsertSalaryConfig, updateUser };
}

