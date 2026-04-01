import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi, LoginData, RegisterData } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useLogin() {
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      if (data.user.tenantId) {
        localStorage.setItem('tenantId', data.user.tenantId);
      }
      setUser(data.user);
      setToken(data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
    },
  });
}

export function useRegister() {
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setToken(data.token);
      toast.success(`Welcome, ${data.user.name}!`);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      return new Promise<void>((resolve) => {
        resolve();
      });
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('tenantId');
      logout();
      toast.success('Logged out successfully');
    },
  });
}
