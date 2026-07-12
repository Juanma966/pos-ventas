import useSWR from 'swr';
import { reportService } from 'services/reportService';

export default function useInventoryReport(params = {}) {
  const key = ['/reports/inventory', JSON.stringify(params)];
  const { data, error, isLoading } = useSWR(key, () => reportService.getInventory(params));
  return { report: data, error, isLoading };
}
