import useSWR from 'swr';
import { employeeService } from 'services/employeeService';

export default function useEmployees(params = {}) {
  const key = ['/employees', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => employeeService.getAll(params));
  return { employees: data ?? [], error, isLoading, mutate };
}
