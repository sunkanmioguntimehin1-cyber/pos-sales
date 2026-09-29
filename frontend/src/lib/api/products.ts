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
  /**
   * Total held across all locations, except when the request was scoped with
   * `?branchId=`, in which case it is that location's quantity. Read
   * `totalStock` for the company-wide figure either way.
   */
  stock: number;
  /** Company-wide total, always present. Equals `stock` unless location-scoped. */
  totalStock: number;
  /**
   * The stock level a product should be reordered at — low enough to flag
   * "reorder now" without emptying the shelf. This is the selected location's
   * per-branch target when the request was scoped with `?branchId=`, and the
   * fallback company-wide default otherwise.
   */
  minQuantity?: number;
  /** The HQ-wide default target, used when a branch has never set its own. */
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: string;
}

/** One row of a product's per-location stock breakdown. */
export interface ProductStockLevel {
  id: string;
  branchId: string;
  branchName: string;
  branchType: 'head_office' | 'branch';
  quantity: number;
  /** That location's reorder target; `lowStockThreshold` when never set. */
  minQuantity?: number;
  updatedAt: string;
}

export interface ProductStockBreakdown {
  stockLevels: ProductStockLevel[];
  total: number;
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
  getAll: (params?: { category?: string; search?: string; isActive?: boolean; branchId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    // Scopes the returned `stock` to one location. The POS passes the branch
    // its terminal is set to, so a product reads as unavailable at a branch
    // that has never been sent any units.
    if (params?.branchId) searchParams.set('branchId', params.branchId);
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
  
  /** `branchId` defaults server-side to the head office when omitted. */
  adjustStock: (productId: string, adjustment: number, type?: 'set' | 'adjust', branchId?: string) =>
    api.post<{ product: Product }>(
      `/api/products/${productId}/stock`,
      { adjustment, type, branchId }
    ).then(res => res.data.product),

  /**
   * Sets the per-branch reorder target (`minQuantity`) for a product. `0` is a
   * deliberate "never flag this" and is kept as-is by the backend.
   */
  setStockTarget: (productId: string, branchId: string, minQuantity: number) =>
    api.put<{ product: Product }>(
      `/api/products/${productId}/stock/${branchId}`,
      { minQuantity }
    ).then(res => res.data.product),
  
  /** Where this product's stock is held, by location. */
  getStock: (productId: string) =>
    api.get<ProductStockBreakdown>(`/api/products/${productId}/stock`).then(res => res.data),
  
  getCategories: () => 
    api.get<{ categories: Category[] }>('/api/products/categories').then(res => res.data.categories),
  
  createCategory: (data: { name: string; description?: string; color?: string }) => 
    api.post<{ category: Category }>('/api/products/categories', data).then(res => res.data.category),
  
  updateCategory: (categoryId: string, data: Partial<Category>) => 
    api.put<{ category: Category }>(`/api/products/categories/${categoryId}`, data).then(res => res.data.category),
  
  deleteCategory: (categoryId: string) => 
    api.delete<{ message: string }>(`/api/products/categories/${categoryId}`).then(res => res.data),
};
