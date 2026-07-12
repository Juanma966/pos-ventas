import useSWR from 'swr';
import { settingsService } from 'services/settingsService';

export default function useCompany() {
  const { data, error, isLoading, mutate } = useSWR('/settings/company', () => settingsService.getCompany());
  return { company: data, error, isLoading, mutate };
}
