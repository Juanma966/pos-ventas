import useSWR from 'swr';
import { saleService } from 'services/saleService';

export function useSales(params = {}) {
  const key = ['/sales', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => saleService.getAll(params));
  return {
    sales: data?.items ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    error,
    isLoading,
    mutate,
  };
}

export function useSale(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/sales/${id}` : null,
    () => saleService.getById(id)
  );
  return { sale: data, error, isLoading, mutate };
}
