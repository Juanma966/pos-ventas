import useSWR from 'swr';
import { fixedExpenseService } from 'services/fixedExpenseService';

export function useFixedExpenses(params = {}) {
  const key = ['/fixed-expenses', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => fixedExpenseService.getAll(params));
  return { expenses: data ?? [], error, isLoading, mutate };
}

export function useFixedExpensesSummary() {
  const { data, error, isLoading, mutate } = useSWR('/fixed-expenses/summary', () => fixedExpenseService.getSummary());
  return { summary: data, error, isLoading, mutate };
}
