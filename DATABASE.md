# Database Integration Guide

## Overview

The Juice Bar POS now uses **SQLite** via `better-sqlite3` for persistent data storage. All products, orders, and sales data are stored locally in a SQLite database.

## Database Location

The database file (`juicebar.db`) is stored in the Electron app's userData directory:
- **Windows**: `%APPDATA%\juice-bar-pos\juicebar.db`
- **macOS**: `~/Library/Application Support/juice-bar-pos/juicebar.db`
- **Linux**: `~/.config/juice-bar-pos/juicebar.db`

## Database Schema

### Tables

#### `products`
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Categories**: `cold-press`, `smoothies`, `shots`, `add-ons`

#### `orders`
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total REAL NOT NULL,
  tax REAL NOT NULL,
  subtotal REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### `order_items`
```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## API Methods

### Product Operations

```typescript
// Get all products
await window.api.getAllProducts()

// Get product by ID
await window.api.getProductById(id: string)

// Create new product
await window.api.createProduct({
  id: string,
  title: string,
  category: string,
  price: number,
  image?: string
})

// Update product
await window.api.updateProduct(id: string, {
  title?: string,
  category?: string,
  price?: number,
  image?: string
})

// Delete product
await window.api.deleteProduct(id: string)
```

### Order Operations

```typescript
// Create order (complete sale)
await window.api.createOrder({
  subtotal: number,
  tax: number,
  total: number,
  items: [{
    product_id: string,
    product_name: string,
    quantity: number,
    price: number
  }]
})

// Get orders
await window.api.getOrders(limit?: number)

// Get order items
await window.api.getOrderItems(orderId: number)
```

### Sales Analytics

```typescript
// Get sales report (grouped by date and product)
await window.api.getSalesReport(days?: number)

// Get total revenue
await window.api.getTotalRevenue(days?: number)

// Get total orders count
await window.api.getTotalOrders(days?: number)

// Get top selling products
await window.api.getTopProducts(limit?: number, days?: number)
```

## Initial Data

The database is automatically seeded with sample products on first run:
- Green Detox ($5.50)
- Berry Blast ($6.00)
- Ginger Shot ($3.00)
- Protein Add-On ($1.50)
- Citrus Mix ($5.00)
- Tropical Paradise ($6.50)
- Carrot Ginger ($5.50)
- Turmeric Shot ($3.50)

## Architecture

### Main Process (`src/main/`)
- **`database.ts`**: Core database module with all CRUD operations
- **`index.ts`**: IPC handlers that expose database methods to renderer

### Preload (`src/preload/`)
- **`index.ts`**: Context bridge that exposes database API to renderer
- **`index.d.ts`**: TypeScript definitions for the database API

### Renderer Process (`src/renderer/`)
Components use `window.api.*` methods to interact with the database:
- **`ProductManagement.tsx`**: CRUD operations for products
- **`ItemsSection.tsx`**: Displays products from database
- **`OrderSidebar.tsx`**: Saves completed orders
- **`SalesReport.tsx`**: Displays analytics from database

## Features

✅ **Product Management**: Add, edit, delete products in admin panel
✅ **Order Persistence**: All completed sales are stored
✅ **Sales Analytics**: Real-time reports from database
✅ **Automatic Initialization**: Database created on first launch
✅ **Data Integrity**: Foreign key constraints and indexes
✅ **Performance**: WAL mode enabled for better concurrency

## Development

### Rebuild Native Modules

If you encounter issues with `better-sqlite3`, rebuild for Electron:

```bash
npm install
npm run postinstall
```

### View Database

Use any SQLite viewer to inspect the database:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite Viewer (VS Code Extension)](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite)

## Backup & Export

To backup your data:
1. Locate the database file in your userData directory
2. Copy `juicebar.db` to a safe location
3. To restore, replace the file in userData directory

## Future Enhancements

- [ ] Export sales reports to CSV/PDF
- [ ] Database migration system
- [ ] Cloud sync capabilities
- [ ] Multi-store support
- [ ] Advanced filtering and search
- [ ] Inventory tracking integration
