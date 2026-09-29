export { useLogin, useLogout } from './useAuth';
export { useStore, useUpdateStore } from './useStore';
export { useStaff, useStaffById, useCreateStaff, useUpdateStaff, useDeleteStaff, useVerifyPin, type Staff } from './useStaff';
export {
  useProducts, useProduct, useProductStock, useCreateProduct, useUpdateProduct, useDeleteProduct, useAdjustStock,
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  type Product, type Category, type ProductStockLevel,
  getProductCategoryName, getProductCategoryId,
} from './useProducts';
export {
  useOrders, useOrder, useCreateOrder, useUpdateOrderStatus, type Order,
  getOrderCustomerName, getOrderStaffName, getOrderBranchName,
} from './useOrders';
export { useCustomers, useCustomer, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, type Customer } from './useCustomers';
export { useBranches, useBranch, useActiveBranch, useCreateBranch, useUpdateBranch, useDeleteBranch, type Branch } from './useBranches';
export {
  useTransfers, useCreateTransfer, type StockTransfer,
  getTransferFromName, getTransferToName, getTransferStaffName, getTransferCounterparty,
} from './useTransfers';
