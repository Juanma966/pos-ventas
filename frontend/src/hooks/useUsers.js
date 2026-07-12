import useSWR from 'swr';
import { userService } from 'services/userService';

export function useUsers(params = {}) {
  const key = ['/users', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR(key, () => userService.getAll(params));
  return { users: data ?? [], error, isLoading, mutate };
}

export function useRoles() {
  const { data, error, isLoading } = useSWR('/users/roles', () => userService.getRoles());
  return { roles: data ?? [], error, isLoading };
}
