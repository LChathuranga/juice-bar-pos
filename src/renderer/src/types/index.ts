export interface Product {
  id: string
  title: string
  category: string
  price: number
  image?: string
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  total: number
  tax: number
  subtotal: number
  created_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: string
  product_name: string
  quantity: number
  price: number
  created_at: string
}

export interface Sale {
  date: string
  product: string
  quantity: number
  revenue: number
}

export interface TopProduct {
  product: string
  quantity: number
  revenue: number
}

export interface CartItem {
  id: string
  title: string
  price: number
  qty: number
}
