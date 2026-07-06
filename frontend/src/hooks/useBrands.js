import useSWR from 'swr';
import { brandService } from 'services/brandService';

export default function useBrands() {
  const { data, error, isLoading, mutate } = useSWR('/brands', brandService.getAll);
  return { brands: data ?? [], error, isLoading, mutate };
}
