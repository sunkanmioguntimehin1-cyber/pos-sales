export { default as api } from './axios';
export { authApi, type LoginData, type LoginResponse, type User } from './auth';
export { staffApi, type Staff, type CreateStaffData, type UpdateStaffData } from './staff';
export {
  productsApi, type Product, type Category, type CreateProductData, type PopulatedCategory,
  getProductCategoryName, getProductCategoryId,
} from './products';
export {
  ordersApi, type Order, type CreateOrderData, type OrderItem,
  type PopulatedCustomerRef, type PopulatedNameRef,
  getOrderCustomerName, getOrderStaffName, getOrderBranchName,
} from './orders';
export { customersApi, type Customer, type CreateCustomerData } from './customers';
export { branchesApi, type Branch, type CreateBranchData } from './branches';
export { storeApi, type Store, type UpdateStoreData, type PaymentMethodConfig } from './store';
