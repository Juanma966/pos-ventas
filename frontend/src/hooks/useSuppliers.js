import useSWR from 'swr';
import { supplierService } from 'services/supplierService';

export default function useSuppliers(params = {}) {
  const key = ['/suppliers', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => supplierService.getAll(params));
  return {
    suppliers: data?.items ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    error,
    isLoading,
    mutate,
  };
}
