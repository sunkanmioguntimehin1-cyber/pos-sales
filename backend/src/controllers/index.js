export { login, getMe } from './auth.controller.js';
export { getStore, updateStore } from './store.controller.js';
export { getStaff, createStaff, updateStaff, deleteStaff, verifyPin } from './staff.controller.js';
export {
  getProducts, createProduct, updateProduct, deleteProduct, adjustStock,
  getCategories, createCategory, updateCategory, deleteCategory
} from './products.controller.js';
export { getOrders, createOrder, getOrder, updateOrderStatus } from './orders.controller.js';
export { getCustomers, createCustomer, updateCustomer, deleteCustomer } from './customers.controller.js';
export { getBranches, createBranch, updateBranch, deleteBranch } from './branches.controller.js';
