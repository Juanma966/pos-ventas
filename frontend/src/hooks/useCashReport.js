import useSWR from 'swr';
import { reportService } from 'services/reportService';

export default function useCashReport(params = {}) {
  const key = ['/reports/cash', JSON.stringify(params)];
  const { data, error, isLoading } = useSWR(key, () => reportService.getCash(params));
  return { report: data, error, isLoading };
}
