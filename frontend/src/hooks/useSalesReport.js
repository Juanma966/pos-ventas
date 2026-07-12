import useSWR from 'swr';
import { reportService } from 'services/reportService';

export default function useSalesReport(params = {}) {
  const key = ['/reports/sales', JSON.stringify(params)];
  const { data, error, isLoading } = useSWR(key, () => reportService.getSales(params));
  return { report: data, error, isLoading };
}
