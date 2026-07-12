import useSWR from 'swr';
import { branchService } from 'services/branchService';

export default function useBranches() {
  const { data, error, isLoading, mutate } = useSWR('/branches', () => branchService.getAll());
  return { branches: data ?? [], error, isLoading, mutate };
}
