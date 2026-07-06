import useSWR from 'swr';
import { customerService } from 'services/customerService';

export default function useCustomers(params = {}) {
  const key = ['/customers', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => customerService.getAll(params));
  return {
    customers: data?.items ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    error,
    isLoading,
    mutate,
  };
}
