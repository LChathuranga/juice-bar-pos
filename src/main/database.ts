import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { unlinkSync, existsSync } from 'fs'
import { is } from '@electron-toolkit/utils'

let db: Database.Database | null = null

export interface Product {
  id: string
  title: string
  category: string
  price: number
  image?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  total: number
  tax: number
  subtotal: number
  discount: number
  payment_method: string
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

export interface ShopSettings {
  id: number
  name: string
  logo: string
  address: string
  phone: string
  updated_at: string
}

export interface Admin {
  id: string
  username: string
  password: string
  role: string
  created_at: string
}

export function initDatabase(): Database.Database {
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'juicebar.db')
  
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  // Check if we need a fresh start (only admins table exists or no tables)
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as Array<{ name: string }>
  const tableNames = tables.map(t => t.name)
  
  // If only admins table exists, or if we have old schema with issues, drop and recreate
  const hasOnlyAdmins = tableNames.length === 1 && tableNames.includes('admins')
  const hasOldSchema = tableNames.includes('order_items') && !tableNames.includes('shop_settings')
  
  if (hasOnlyAdmins || hasOldSchema) {
    console.log('Dropping existing tables for fresh migration...')
    db.exec(`
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS shop_settings;
      DROP TABLE IF EXISTS admins;
    `)
    console.log('Dropped all tables. Creating fresh schema...')
  }

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      tax REAL NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'cash',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id TEXT,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

    CREATE TABLE IF NOT EXISTS shop_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT 'Juice Bar POS',
      logo TEXT DEFAULT '',
      address TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Add migration for icon column in categories table
  const categoriesInfo = db.prepare("PRAGMA table_info(categories)").all() as Array<{ name: string }>
  const hasIconColumn = categoriesInfo.some(col => col.name === 'icon')
  
  if (!hasIconColumn) {
    console.log('Adding icon column to categories table...')
    db.exec('ALTER TABLE categories ADD COLUMN icon TEXT')
    console.log('Icon column added successfully')
  }

  // Seed default shop settings if not exists
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM shop_settings').get() as { count: number }
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO shop_settings (id, name, logo, address, phone)
      VALUES (1, 'Juice Bar POS', '', '', '')
    `).run()
  }

  // Seed default admin if not exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number }
  if (adminCount.count === 0) {
    const crypto = require('crypto')
    const defaultPassword = 'admin123'
    const hash = crypto.createHash('sha256').update(defaultPassword).digest('hex')
    
    db.prepare(`
      INSERT INTO admins (id, username, password, role)
      VALUES ('admin-1', 'admin', ?, 'admin')
    `).run(hash)
  }

  return db
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

// Product operations
export function getAllProducts(): Product[] {
  const db = getDatabase()
  return db.prepare('SELECT * FROM products ORDER BY category, title').all() as Product[]
}

export function getProductById(id: string): Product | undefined {
  const db = getDatabase()
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined
}

export function createProduct(product: Omit<Product, 'created_at' | 'updated_at'>): Product {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO products (id, title, category, price, image)
    VALUES (?, ?, ?, ?, ?)
  `)
  stmt.run(product.id, product.title, product.category, product.price, product.image || null)
  return getProductById(product.id)!
}

export function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Product {
  const db = getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (updates.title !== undefined) {
    fields.push('title = ?')
    values.push(updates.title)
  }
  if (updates.category !== undefined) {
    fields.push('category = ?')
    values.push(updates.category)
  }
  if (updates.price !== undefined) {
    fields.push('price = ?')
    values.push(updates.price)
  }
  if (updates.image !== undefined) {
    fields.push('image = ?')
    values.push(updates.image)
  }

  fields.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  const stmt = db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`)
  stmt.run(...values)
  return getProductById(id)!
}

export function deleteProduct(id: string): void {
  const db = getDatabase()
  
  // Get the product to check if it has an image
  const product = getProductById(id)
  if (product?.image) {
    try {
      // Construct the path to the image file
      const imagesPath = is.dev 
        ? join(__dirname, '../../src/renderer/src/assets/images')
        : join(process.resourcesPath, 'app.asar.unpacked/src/renderer/src/assets/images')
      
      const imagePath = join(imagesPath, product.image)
      
      // Delete the image file if it exists
      if (existsSync(imagePath)) {
        unlinkSync(imagePath)
        console.log(`Deleted image file: ${product.image}`)
      }
    } catch (error) {
      console.error('Error deleting product image:', error)
      // Continue with product deletion even if image deletion fails
    }
  }
  
  // First, set product_id to null in order_items for this product
  // This maintains order history while allowing product deletion
  db.prepare('UPDATE order_items SET product_id = NULL WHERE product_id = ?').run(id)
  // Now delete the product
  db.prepare('DELETE FROM products WHERE id = ?').run(id)
}

// Order operations
export function createOrder(order: { subtotal: number; tax: number; total: number; discount?: number; payment_method?: string; items: Array<{ product_id: string; product_name: string; quantity: number; price: number }> }): Order {
  const db = getDatabase()
  
  const insertOrder = db.prepare(`
    INSERT INTO orders (subtotal, tax, total, discount, payment_method)
    VALUES (?, ?, ?, ?, ?)
  `)
  
  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
    VALUES (?, ?, ?, ?, ?)
  `)

  const createOrderTransaction = db.transaction((orderData) => {
    const result = insertOrder.run(
      orderData.subtotal, 
      orderData.tax, 
      orderData.total, 
      orderData.discount || 0,
      orderData.payment_method || 'cash'
    )
    const orderId = result.lastInsertRowid as number

    for (const item of orderData.items) {
      insertOrderItem.run(orderId, item.product_id, item.product_name, item.quantity, item.price)
    }

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Order
  })

  return createOrderTransaction(order)
}

export function getOrderItems(orderId: number): OrderItem[] {
  const db = getDatabase()
  return db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as OrderItem[]
}

// Sales analytics
// days = 0 means today only, days = -1 means all time
export function getSalesReport(days = 7): Sale[] {
  const db = getDatabase()
  let query: string
  const daysNum = Number(days)
  
  if (daysNum === 0) {
    // Today only
    query = `
      SELECT 
        DATE(oi.created_at) as date,
        oi.product_name as product,
        SUM(oi.quantity) as quantity,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      WHERE DATE(oi.created_at) = DATE('now', 'localtime')
      GROUP BY DATE(oi.created_at), oi.product_name
      ORDER BY date DESC, revenue DESC
    `
    return db.prepare(query).all() as Sale[]
  } else if (daysNum === -1 || daysNum < 0) {
    // All time
    query = `
      SELECT 
        DATE(oi.created_at) as date,
        oi.product_name as product,
        SUM(oi.quantity) as quantity,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      GROUP BY DATE(oi.created_at), oi.product_name
      ORDER BY date DESC, revenue DESC
    `
    return db.prepare(query).all() as Sale[]
  } else {
    query = `
      SELECT 
        DATE(oi.created_at) as date,
        oi.product_name as product,
        SUM(oi.quantity) as quantity,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      WHERE oi.created_at >= DATE('now', 'localtime', '-' || ? || ' days')
      GROUP BY DATE(oi.created_at), oi.product_name
      ORDER BY date DESC, revenue DESC
    `
    return db.prepare(query).all(daysNum) as Sale[]
  }
}

// days = 0 means today only, days = -1 means all time
export function getTotalRevenue(days = 7): number {
  const db = getDatabase()
  let result: { total: number }
  const daysNum = Number(days)
  
  if (daysNum === 0) {
    result = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM orders
      WHERE DATE(created_at) = DATE('now', 'localtime')
    `).get() as { total: number }
  } else if (daysNum === -1 || daysNum < 0) {
    result = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM orders
    `).get() as { total: number }
  } else {
    result = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM orders
      WHERE created_at >= DATE('now', 'localtime', '-' || ? || ' days')
    `).get(daysNum) as { total: number }
  }
  return result.total
}

// days = 0 means today only, days = -1 means all time
export function getTotalOrders(days = 7): number {
  const db = getDatabase()
  let result: { count: number }
  const daysNum = Number(days)
  
  if (daysNum === 0) {
    result = db.prepare(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE DATE(created_at) = DATE('now', 'localtime')
    `).get() as { count: number }
  } else if (daysNum === -1 || daysNum < 0) {
    result = db.prepare(`
      SELECT COUNT(*) as count
      FROM orders
    `).get() as { count: number }
  } else {
    result = db.prepare(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE created_at >= DATE('now', 'localtime', '-' || ? || ' days')
    `).get(daysNum) as { count: number }
  }
  return result.count
}

// days = -1 means all time
export function getTopProducts(limit = 5, days = 30): Array<{ product: string; quantity: number; revenue: number }> {
  const db = getDatabase()
  const daysNum = Number(days)
  
  if (daysNum === 0) {
    const query = `
      SELECT 
        oi.product_name as product,
        SUM(oi.quantity) as quantity,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      WHERE DATE(oi.created_at) = DATE('now', 'localtime')
      GROUP by oi.product_name
      ORDER BY revenue DESC
      LIMIT ?
    `
    return db.prepare(query).all(limit) as Array<{ product: string; quantity: number; revenue: number }>
  } else if (daysNum === -1 || daysNum < 0) {
    const query = `
      SELECT 
        oi.product_name as product,
        SUM(oi.quantity) as quantity,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      GROUP BY oi.product_name
      ORDER BY revenue DESC
      LIMIT ?
    `
    return db.prepare(query).all(limit) as Array<{ product: string; quantity: number; revenue: number }>
  } else {
    const query = `
      SELECT 
        oi.product_name as product,
        SUM(oi.quantity) as quantity,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      WHERE oi.created_at >= DATE('now', 'localtime', '-' || ? || ' days')
      GROUP BY oi.product_name
      ORDER BY revenue DESC
      LIMIT ?
    `
    return db.prepare(query).all(daysNum, limit) as Array<{ product: string; quantity: number; revenue: number }>
  }
}

// days = 0 means today only, days = -1 means all time
export function getOrders(limit = 50, days?: number): Order[] {
  const db = getDatabase()
  const daysNum = days !== undefined ? Number(days) : undefined
  
  if (daysNum === 0) {
    return db.prepare(`
      SELECT * FROM orders 
      WHERE DATE(created_at) = DATE('now', 'localtime')
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit) as Order[]
  } else if (daysNum === -1 || (daysNum !== undefined && daysNum < 0)) {
    return db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?').all(limit) as Order[]
  } else {
    return db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?').all(limit) as Order[]
  }
}

// Category operations
export function getAllCategories(): Category[] {
  const db = getDatabase()
  return db.prepare('SELECT * FROM categories ORDER BY name').all() as Category[]
}

export function getCategoryById(id: string): Category | undefined {
  const db = getDatabase()
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined
}

export function createCategory(category: Omit<Category, 'created_at' | 'updated_at'>): Category {
  const db = getDatabase()
  db.prepare(`
    INSERT INTO categories (id, name, icon)
    VALUES (?, ?, ?)
  `).run(category.id, category.name, category.icon || null)
  return getCategoryById(category.id)!
}

export function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Category {
  const db = getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push('name = ?')
    values.push(updates.name)
  }

  if (updates.icon !== undefined) {
    fields.push('icon = ?')
    values.push(updates.icon)
  }

  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)
    db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  }

  return getCategoryById(id)!
}

export function deleteCategory(id: string): void {
  const db = getDatabase()
  db.prepare('DELETE FROM categories WHERE id = ?').run(id)
}

// Shop Settings operations
export function getShopSettings(): ShopSettings {
  const db = getDatabase()
  const settings = db.prepare('SELECT * FROM shop_settings WHERE id = 1').get() as ShopSettings | undefined
  if (!settings) {
    // Create default settings if not exists
    db.prepare(`
      INSERT INTO shop_settings (id, name, logo, address, phone)
      VALUES (1, 'Juice Bar POS', '', '', '')
    `).run()
    return db.prepare('SELECT * FROM shop_settings WHERE id = 1').get() as ShopSettings
  }
  return settings
}

export function saveShopSettings(settings: Partial<Omit<ShopSettings, 'id' | 'updated_at'>>): ShopSettings {
  const db = getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (settings.name !== undefined) {
    fields.push('name = ?')
    values.push(settings.name)
  }
  if (settings.logo !== undefined) {
    fields.push('logo = ?')
    values.push(settings.logo)
  }
  if (settings.address !== undefined) {
    fields.push('address = ?')
    values.push(settings.address)
  }
  if (settings.phone !== undefined) {
    fields.push('phone = ?')
    values.push(settings.phone)
  }

  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP')
    db.prepare(`UPDATE shop_settings SET ${fields.join(', ')} WHERE id = 1`).run(...values)
  }

  return getShopSettings()
}

// Admin operations
export function getAllAdmins(): Admin[] {
  const db = getDatabase()
  return db.prepare('SELECT id, username, role, created_at FROM admins ORDER BY created_at').all() as Admin[]
}

export function getAdminByUsername(username: string): Admin | undefined {
  const db = getDatabase()
  return db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as Admin | undefined
}

export function createAdmin(admin: { username: string; password: string; role: string }): Admin {
  const db = getDatabase()
  const crypto = require('crypto')
  const id = `admin-${Date.now()}`
  const hash = crypto.createHash('sha256').update(admin.password).digest('hex')
  
  try {
    db.prepare(`
      INSERT INTO admins (id, username, password, role)
      VALUES (?, ?, ?, ?)
    `).run(id, admin.username, hash, admin.role)
    
    return db.prepare('SELECT id, username, role, created_at FROM admins WHERE id = ?').get(id) as Admin
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Username already exists')
    }
    throw error
  }
}

export function updateAdminPassword(username: string, currentPassword: string, newPassword: string): boolean {
  const db = getDatabase()
  const crypto = require('crypto')
  
  const admin = getAdminByUsername(username)
  if (!admin) {
    throw new Error('Admin not found')
  }

  const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex')
  if (admin.password !== currentHash) {
    throw new Error('Current password is incorrect')
  }

  const newHash = crypto.createHash('sha256').update(newPassword).digest('hex')
  db.prepare('UPDATE admins SET password = ? WHERE username = ?').run(newHash, username)
  return true
}

export function deleteAdmin(id: string): void {
  const db = getDatabase()
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number }
  
  if (adminCount.count <= 1) {
    throw new Error('Cannot delete the last admin account')
  }
  
  db.prepare('DELETE FROM admins WHERE id = ?').run(id)
}

export function verifyAdmin(username: string, password: string): { valid: boolean; role?: string; username?: string } {
  const admin = getAdminByUsername(username)
  if (!admin) {
    return { valid: false }
  }

  const crypto = require('crypto')
  const hash = crypto.createHash('sha256').update(password).digest('hex')
  const isValid = admin.password === hash
  
  if (isValid) {
    return { valid: true, role: admin.role, username: admin.username }
  }
  return { valid: false }
}

// Migration/Reset operations
export function clearAllTables(): void {
  const db = getDatabase()
  console.log('Clearing all data from tables...')
  
  db.exec(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM shop_settings;
  `)
  
  console.log('All tables cleared successfully (admins preserved)')
}

export function resetToDefaults(): void {
  const db = getDatabase()
  console.log('Resetting database to defaults...')
  
  // Clear all data including admins
  clearAllTables()
  db.exec('DELETE FROM admins;')
  
  // Seed default shop settings
  db.prepare(`
    INSERT INTO shop_settings (id, name, logo, address, phone)
    VALUES (1, 'Juice Bar POS', '', '', '')
  `).run()
  
  // Seed default admin
  const crypto = require('crypto')
  const defaultPassword = 'admin123'
  const hash = crypto.createHash('sha256').update(defaultPassword).digest('hex')
  
  db.prepare(`
    INSERT INTO admins (id, username, password, role)
    VALUES ('admin-1', 'admin', ?, 'admin')
  `).run(hash)
  
  console.log('Database reset to defaults successfully')
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
