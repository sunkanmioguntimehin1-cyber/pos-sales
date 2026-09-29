import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productsApi, Product, CreateProductData, Category } from '@/lib/api';
import { snapshotLists, patchLists, restoreLists } from './optimistic';

export type { Product, Category, CreateProductData, ProductStockLevel } from '@/lib/api/products';
export { getProductCategoryName, getProductCategoryId } from '@/lib/api/products';

const PRODUCTS = ['products'] as const;
const CATEGORIES = ['categories'] as const;

export function useProducts(filters?: { category?: string; search?: string; isActive?: boolean; branchId?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters),
    staleTime: 60 * 1000,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    // Singular key: list queries live under ['products', filters], and sharing
    // a prefix would make list mutations overwrite this single-object cache.
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(productId),
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productsApi.create(data),
    onMutate: async (newProduct) => {
      const previous = await snapshotLists<Product>(queryClient, PRODUCTS);

      patchLists<Product>(queryClient, PRODUCTS, (old) => [
        ...old,
        {
          ...newProduct,
          id: `temp-${Date.now()}`,
          stock: newProduct.stock || 0,
          // New stock is booked into the head office, so on day one the total
          // and the location figure are the same number.
          totalStock: newProduct.stock || 0,
          lowStockThreshold: newProduct.lowStockThreshold || 10,
          isActive: newProduct.isActive ?? true,
          createdAt: new Date().toISOString(),
        } as Product,
      ]);

      return { previous };
    },
    onSuccess: () => {
      toast.success('Product added successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Product>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Partial<CreateProductData> }) =>
      productsApi.update(productId, data),
    onMutate: async ({ productId, data }) => {
      const previous = await snapshotLists<Product>(queryClient, PRODUCTS);

      patchLists<Product>(queryClient, PRODUCTS, (old) =>
        old.map((product) =>
          product.id === productId ? { ...product, ...data } : product
        )
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Product updated successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Product>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsApi.delete(productId),
    onMutate: async (productId) => {
      const previous = await snapshotLists<Product>(queryClient, PRODUCTS);

      patchLists<Product>(queryClient, PRODUCTS, (old) =>
        old.filter((product) => product.id !== productId)
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Product>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, adjustment, type, branchId }: {
      productId: string;
      adjustment: number;
      type?: 'set' | 'adjust';
      branchId?: string;
    }) => productsApi.adjustStock(productId, adjustment, type, branchId),
    onSuccess: () => {
      toast.success('Stock adjusted successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stock'] });
    },
  });
}

/** Where a single product's stock is held, by location. */
export function useProductStock(productId: string | null) {
  return useQuery({
    // Shares the ['product', id] prefix prefix with useProduct; both are
    // per-product reads that must not collide with the list caches.
    queryKey: ['product-stock', productId],
    queryFn: () => productsApi.getStock(productId as string),
    enabled: !!productId,
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
      queryClient.invalidateQueries({ queryKey: CATEGORIES });
      queryClient.invalidateQueries({ queryKey: PRODUCTS });
    },
  });
}
