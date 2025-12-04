import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Product operations
  getAllProducts: () => ipcRenderer.invoke('db:getAllProducts'),
  getProductById: (id: string) => ipcRenderer.invoke('db:getProductById', id),
  createProduct: (product: any) => ipcRenderer.invoke('db:createProduct', product),
  updateProduct: (id: string, updates: any) => ipcRenderer.invoke('db:updateProduct', id, updates),
  deleteProduct: (id: string) => ipcRenderer.invoke('db:deleteProduct', id),
  
  // Order operations
  createOrder: (order: any) => ipcRenderer.invoke('db:createOrder', order),
  getOrders: (limit?: number) => ipcRenderer.invoke('db:getOrders', limit),
  getOrderItems: (orderId: number) => ipcRenderer.invoke('db:getOrderItems', orderId),
  
  // Sales analytics
  getSalesReport: (days?: number) => ipcRenderer.invoke('db:getSalesReport', days),
  getTotalRevenue: (days?: number) => ipcRenderer.invoke('db:getTotalRevenue', days),
  getTotalOrders: (days?: number) => ipcRenderer.invoke('db:getTotalOrders', days),
  getTopProducts: (limit?: number, days?: number) => ipcRenderer.invoke('db:getTopProducts', limit, days),
  
  // Category operations
  getAllCategories: () => ipcRenderer.invoke('db:getAllCategories'),
  getCategoryById: (id: string) => ipcRenderer.invoke('db:getCategoryById', id),
  createCategory: (category: any) => ipcRenderer.invoke('db:createCategory', category),
  updateCategory: (id: string, updates: any) => ipcRenderer.invoke('db:updateCategory', id, updates),
  deleteCategory: (id: string) => ipcRenderer.invoke('db:deleteCategory', id),
  
  // Shop Settings operations
  getShopSettings: () => ipcRenderer.invoke('db:getShopSettings'),
  saveShopSettings: (settings: any) => ipcRenderer.invoke('db:saveShopSettings', settings),
  
  // Admin operations
  getAllAdmins: () => ipcRenderer.invoke('db:getAllAdmins'),
  createAdmin: (admin: any) => ipcRenderer.invoke('db:createAdmin', admin),
  deleteAdmin: (id: string) => ipcRenderer.invoke('db:deleteAdmin', id),
  changePassword: (username: string, currentPassword: string, newPassword: string) => 
    ipcRenderer.invoke('db:changePassword', username, currentPassword, newPassword),
  verifyAdmin: (username: string, password: string) => 
    ipcRenderer.invoke('db:verifyAdmin', username, password),
  
  // Migration/Reset operations
  clearAllTables: () => ipcRenderer.invoke('db:clearAllTables'),
  resetToDefaults: () => ipcRenderer.invoke('db:resetToDefaults'),
  
  // Image operations
  saveProductImage: (imageData: string, filename: string) => ipcRenderer.invoke('save-product-image', imageData, filename),
  
  // Print operations
  printReceipt: (receiptData: any) => ipcRenderer.invoke('print-receipt', receiptData),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
