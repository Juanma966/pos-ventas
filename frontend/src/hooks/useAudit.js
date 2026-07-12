import useSWR from 'swr';
import { auditService } from 'services/auditService';

export default function useAudit(params = {}) {
  const key = ['/audit', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => auditService.getAll(params));
  return {
    logs: data?.items ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    error,
    isLoading,
    mutate,
  };
}
