export { default as api } from './axios';
export { authApi, type LoginData, type LoginResponse, type User } from './auth';
export { staffApi, type Staff, type CreateStaffData, type UpdateStaffData } from './staff';
export {
  rolesApi, type Role, type RoleSummary, type CreateRoleData, type UpdateRoleData, type PermissionKey,
  type PermissionDefinition, ALL_PERMISSIONS, ALL_PERMISSION_KEYS, PERMISSION_GROUPS, permissionLabel,
} from './roles';
export {
  productsApi, type Product, type Category, type CreateProductData, type PopulatedCategory,
  type ProductStockLevel, type ProductStockBreakdown,
  getProductCategoryName, getProductCategoryId,
} from './products';
export {
  ordersApi, type Order, type CreateOrderData, type OrderItem,
  type PopulatedCustomerRef, type PopulatedNameRef,
  getOrderCustomerName, getOrderStaffName, getOrderBranchName,
} from './orders';
export { customersApi, type Customer, type CreateCustomerData } from './customers';
export { branchesApi, type Branch, type CreateBranchData } from './branches';
export {
  transfersApi, type StockTransfer, type CreateTransferData, type TransferItem,
  getTransferFromName, getTransferToName, getTransferStaffName, getTransferCounterparty,
} from './transfers';
export { storeApi, type Store, type UpdateStoreData, type PaymentMethodConfig } from './store';
export {
  stockMovementsApi, type StockMovement, type StockMovementType, type StockMovementFilters,
} from './stockMovements';
