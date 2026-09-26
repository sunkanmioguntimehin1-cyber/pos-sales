import api from './axios';

export interface PopulatedCategory {
  _id: string;
  id: string;
  name: string;
  color: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  /**
   * The backend populates the category *into* categoryId
   * (`.populate('categoryId', 'name color')`), so this arrives as an object on
   * any product that has a category and as a raw id string otherwise.
   */
  categoryId?: string | PopulatedCategory | null;
  image?: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductData {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  categoryId?: string;
  image?: string;
  stock?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

/** Reads the category name off a product regardless of whether it is populated. */
export function getProductCategoryName(product: Pick<Product, 'categoryId'>): string | undefined {
  const { categoryId } = product;
  if (categoryId && typeof categoryId === 'object') return categoryId.name;
  return undefined;
}

/** Reads the category id off a product regardless of whether it is populated. */
export function getProductCategoryId(product: Pick<Product, 'categoryId'>): string | undefined {
  const { categoryId } = product;
  if (!categoryId) return undefined;
  return typeof categoryId === 'object' ? categoryId.id : categoryId;
}

export const productsApi = {
  getAll: (params?: { category?: string; search?: string; isActive?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    const query = searchParams.toString();
    return api.get<{ products: Product[] }>(`/api/products${query ? `?${query}` : ''}`).then(res => res.data.products);
  },
  
  getById: (productId: string) => 
    api.get<{ product: Product }>(`/api/products/${productId}`).then(res => res.data.product),
  
  create: (data: CreateProductData) => 
    api.post<{ product: Product }>('/api/products', data).then(res => res.data.product),
  
  update: (productId: string, data: Partial<CreateProductData>) => 
    api.put<{ product: Product }>(`/api/products/${productId}`, data).then(res => res.data.product),
  
  delete: (productId: string) => 
    api.delete<{ message: string }>(`/api/products/${productId}`).then(res => res.data),
  
  adjustStock: (productId: string, adjustment: number, type?: 'set' | 'adjust') =>
    api.post<{ product: Product }>(
      `/api/products/${productId}/stock`,
      { adjustment, type }
    ).then(res => res.data.product),
  
  getCategories: () => 
    api.get<{ categories: Category[] }>('/api/products/categories').then(res => res.data.categories),
  
  createCategory: (data: { name: string; description?: string; color?: string }) => 
    api.post<{ category: Category }>('/api/products/categories', data).then(res => res.data.category),
  
  updateCategory: (categoryId: string, data: Partial<Category>) => 
    api.put<{ category: Category }>(`/api/products/categories/${categoryId}`, data).then(res => res.data.category),
  
  deleteCategory: (categoryId: string) => 
    api.delete<{ message: string }>(`/api/products/categories/${categoryId}`).then(res => res.data),
};
