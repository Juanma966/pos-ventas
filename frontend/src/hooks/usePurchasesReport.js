import useSWR from 'swr';
import { reportService } from 'services/reportService';

export default function usePurchasesReport(params = {}) {
  const key = ['/reports/purchases', JSON.stringify(params)];
  const { data, error, isLoading } = useSWR(key, () => reportService.getPurchases(params));
  return { report: data, error, isLoading };
}
