import useSWR from 'swr';
import { cashService } from 'services/cashService';

export default function useCash() {
  const { data, error, isLoading, mutate } = useSWR('/cash/current', () => cashService.getCurrent());
  return {
    session: data ?? null,
    isOpen: !!data,
    error,
    isLoading,
    mutate,
  };
}
