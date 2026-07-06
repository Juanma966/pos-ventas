import useSWR from 'swr';
import { purchaseService } from 'services/purchaseService';

export function usePurchases(params = {}) {
  const key = ['/purchases', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => purchaseService.getAll(params));
  return {
    purchases: data?.items ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    error,
    isLoading,
    mutate,
  };
}

export function usePurchase(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/purchases/${id}` : null,
    () => purchaseService.getById(id)
  );
  return { purchase: data, error, isLoading, mutate };
}
