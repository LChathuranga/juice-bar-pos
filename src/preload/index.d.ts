import { ElectronAPI } from '@electron-toolkit/preload'

interface Product {
  id: string
  title: string
  category: string
  price: number
  image?: string
  created_at: string
  updated_at: string
}

interface Order {
  id: number
  total: number
  tax: number
  subtotal: number
  discount: number
  payment_method: string
  created_at: string
}

interface OrderItem {
  id: number
  order_id: number
  product_id: string
  product_name: string
  quantity: number
  price: number
  created_at: string
}

interface Sale {
  date: string
  product: string
  quantity: number
  revenue: number
}

interface Category {
  id: string
  name: string
  icon?: string
  created_at: string
  updated_at: string
}

interface ShopSettings {
  id: number
  name: string
  logo: string
  address: string
  phone: string
  updated_at: string
}

interface Admin {
  id: string
  username: string
  role: string
  created_at: string
}

interface DatabaseAPI {
  // Product operations
  getAllProducts: () => Promise<Product[]>
  getProductById: (id: string) => Promise<Product | undefined>
  createProduct: (product: Omit<Product, 'created_at' | 'updated_at'>) => Promise<Product>
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
  
  // Order operations
  createOrder: (order: {
    subtotal: number
    tax: number
    total: number
    discount?: number
    payment_method?: string
    items: Array<{
      product_id: string
      product_name: string
      quantity: number
      price: number
    }>
  }) => Promise<Order>
  getOrders: (limit?: number) => Promise<Order[]>
  getOrderItems: (orderId: number) => Promise<OrderItem[]>
  
  // Sales analytics
  getSalesReport: (days?: number) => Promise<Sale[]>
  getTotalRevenue: (days?: number) => Promise<number>
  getTotalOrders: (days?: number) => Promise<number>
  getTopProducts: (limit?: number, days?: number) => Promise<Array<{ product: string; quantity: number; revenue: number }>>
  
  // Category operations
  getAllCategories: () => Promise<Category[]>
  getCategoryById: (id: string) => Promise<Category | undefined>
  createCategory: (category: Omit<Category, 'created_at' | 'updated_at'>) => Promise<Category>
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
  
  // Shop Settings operations
  getShopSettings: () => Promise<ShopSettings>
  saveShopSettings: (settings: Partial<Omit<ShopSettings, 'id' | 'updated_at'>>) => Promise<ShopSettings>
  
  // Admin operations
  getAllAdmins: () => Promise<Admin[]>
  createAdmin: (admin: { username: string; password: string; role: string }) => Promise<Admin>
  deleteAdmin: (id: string) => Promise<void>
  changePassword: (username: string, currentPassword: string, newPassword: string) => Promise<boolean>
  verifyAdmin: (username: string, password: string) => Promise<{ valid: boolean; role?: string; username?: string }>
  
  // Migration/Reset operations
  clearAllTables: () => Promise<void>
  resetToDefaults: () => Promise<void>
  
  // Image operations
  saveProductImage: (imageData: string, filename: string) => Promise<{ success: boolean; filename?: string; error?: string }>
  
  // Print operations
  printReceipt: (receiptData: {
    shopName: string
    orderNumber: string
    date: string
    paymentMethod: string
    items: Array<{ title: string; qty: number; price: number; total: number }>
    subtotal: number
    discount: number
    tax: number
    total: number
  }) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DatabaseAPI
  }
}

