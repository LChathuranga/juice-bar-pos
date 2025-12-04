# Admin View Features

The Juice Bar POS now includes a comprehensive admin dashboard for managing your business.

## Accessing Admin View

Click the **"Admin"** button in the top-right corner of the POS header to switch to the admin dashboard.

## Features

### 1. **Product Management**
- View all products in a table format
- Add new products with name, category, and price
- Edit existing products
- Delete products
- Categories: Cold Press, Smoothies, Shots, Add-Ons

### 2. **Sales Reports**
- Dashboard with key metrics:
  - Total Revenue
  - Total Orders
  - Average Order Value
  - Active Products Count
- Recent sales transaction history
- Top 5 selling products by revenue
- Visual statistics cards with color-coded categories

### 3. **Categories** (Coming Soon)
- Manage product categories
- Add, edit, and delete categories

### 4. **Settings** (Coming Soon)
- Configure system settings
- User management
- Store information

## Navigation

- Use the sidebar to switch between different admin sections
- Click **"Back to POS"** in the admin header to return to the point-of-sale view

## Technical Details

### Components Created:
- `AdminView.tsx` - Main admin container
- `AdminSidebar.tsx` - Navigation sidebar
- `ProductManagement.tsx` - Product CRUD operations
- `SalesReport.tsx` - Sales analytics and reports

### State Management:
- View switching handled in `App.tsx`
- Admin mode toggled via `Header.tsx`
- Local state management for product data (ready for API integration)

## Future Enhancements

- Real database integration (currently using mock data)
- User authentication and role-based access
- Export sales reports to CSV/PDF
- Advanced analytics and charts
- Category management interface
- Inventory tracking
- Employee management
