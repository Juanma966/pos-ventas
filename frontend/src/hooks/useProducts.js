import useSWR from 'swr';
import { productService } from 'services/productService';

export default function useProducts(params = {}) {
  const key = ['/products', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => productService.getAll(params));
  return {
    products: data?.items ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    error,
    isLoading,
    mutate,
  };
}
