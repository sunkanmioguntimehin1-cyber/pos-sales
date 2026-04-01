import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productsApi, Product, CreateProductData, Category } from '@/lib/api';

export type { Product, Category, CreateProductData } from '@/lib/api/products';

export function useProducts(filters?: { category?: string; search?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters),
    staleTime: 60 * 1000,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: () => productsApi.getById(productId),
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productsApi.create(data),
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);

      queryClient.setQueryData<Product[]>(['products'], (old = []) => [
        ...old,
        {
          ...newProduct,
          id: `temp-${Date.now()}`,
          stock: newProduct.stock || 0,
          lowStockThreshold: newProduct.lowStockThreshold || 10,
          isActive: true,
          createdAt: new Date().toISOString(),
        } as Product,
      ]);

      return { previousProducts };
    },
    onSuccess: () => {
      toast.success('Product added successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Partial<CreateProductData> }) =>
      productsApi.update(productId, data),
    onMutate: async ({ productId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);

      queryClient.setQueryData<Product[]>(['products'], (old = []) =>
        old.map(product =>
          product.id === productId ? { ...product, ...data } : product
        )
      );

      return { previousProducts };
    },
    onSuccess: () => {
      toast.success('Product updated successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsApi.delete(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);

      queryClient.setQueryData<Product[]>(['products'], (old = []) =>
        old.filter(product => product.id !== productId)
      );

      return { previousProducts };
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, adjustment, type }: { productId: string; adjustment: number; type?: 'set' | 'adjust' }) =>
      productsApi.adjustStock(productId, adjustment, type),
    onSuccess: () => {
      toast.success('Stock adjusted successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
    staleTime: 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; color?: string }) =>
      productsApi.createCategory(data),
    onSuccess: () => {
      toast.success('Category added successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: Partial<Category> }) =>
      productsApi.updateCategory(categoryId, data),
    onSuccess: () => {
      toast.success('Category updated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => productsApi.deleteCategory(categoryId),
    onSuccess: () => {
      toast.success('Category deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
