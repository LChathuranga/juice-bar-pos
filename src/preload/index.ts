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
