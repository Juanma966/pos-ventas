import useSWR from 'swr';
import { inventoryService } from 'services/inventoryService';

export default function useInventory(params = {}) {
  const key = ['/inventory', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => inventoryService.getMovements(params));
  return {
    movements: data?.items ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    error,
    isLoading,
    mutate,
  };
}
