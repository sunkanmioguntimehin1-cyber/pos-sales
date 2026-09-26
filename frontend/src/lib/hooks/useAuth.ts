import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi, LoginData } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useLogin() {
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setToken(data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return new Promise<void>((resolve) => {
        resolve();
      });
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      logout();
      // Without this, the previous user's cached products/orders/customers stay
      // in memory and are served to whoever logs in next.
      queryClient.clear();
      toast.success('Logged out successfully');
      window.location.href = '/';
    },
  });
}
