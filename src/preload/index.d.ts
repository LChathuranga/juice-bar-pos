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
  created_at: string
  updated_at: string
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
  
  // Image operations
  saveProductImage: (imageData: string, filename: string) => Promise<{ success: boolean; filename?: string; error?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DatabaseAPI
  }
}

