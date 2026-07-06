import useSWR from 'swr';
import { categoryService } from 'services/categoryService';

export default function useCategories() {
  const { data, error, isLoading, mutate } = useSWR('/categories', categoryService.getAll);
  return { categories: data ?? [], error, isLoading, mutate };
}
