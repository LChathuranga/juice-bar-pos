import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as db from './database'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Initialize database
  db.initDatabase()

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers for database operations
  
  // Product operations
  ipcMain.handle('db:getAllProducts', () => {
    return db.getAllProducts()
  })

  ipcMain.handle('db:getProductById', (_, id: string) => {
    return db.getProductById(id)
  })

  ipcMain.handle('db:createProduct', (_, product) => {
    return db.createProduct(product)
  })

  ipcMain.handle('db:updateProduct', (_, id: string, updates) => {
    return db.updateProduct(id, updates)
  })

  ipcMain.handle('db:deleteProduct', (_, id: string) => {
    return db.deleteProduct(id)
  })

  // Order operations
  ipcMain.handle('db:createOrder', (_, order) => {
    return db.createOrder(order)
  })

  ipcMain.handle('db:getOrders', (_, limit?: number) => {
    return db.getOrders(limit)
  })

  ipcMain.handle('db:getOrderItems', (_, orderId: number) => {
    return db.getOrderItems(orderId)
  })

  // Sales analytics
  ipcMain.handle('db:getSalesReport', (_, days?: number) => {
    return db.getSalesReport(days)
  })

  ipcMain.handle('db:getTotalRevenue', (_, days?: number) => {
    return db.getTotalRevenue(days)
  })

  ipcMain.handle('db:getTotalOrders', (_, days?: number) => {
    return db.getTotalOrders(days)
  })

  ipcMain.handle('db:getTopProducts', (_, limit?: number, days?: number) => {
    return db.getTopProducts(limit, days)
  })

  // Category operations
  ipcMain.handle('db:getAllCategories', () => {
    return db.getAllCategories()
  })

  ipcMain.handle('db:getCategoryById', (_, id: string) => {
    return db.getCategoryById(id)
  })

  ipcMain.handle('db:createCategory', (_, category) => {
    return db.createCategory(category)
  })

  ipcMain.handle('db:updateCategory', (_, id: string, updates) => {
    return db.updateCategory(id, updates)
  })

  ipcMain.handle('db:deleteCategory', (_, id: string) => {
    return db.deleteCategory(id)
  })

  // Image operations
  ipcMain.handle('save-product-image', (_, imageData: string, filename: string) => {
    try {
      // Get the path to the renderer's assets/images folder
      const imagesPath = is.dev 
        ? join(__dirname, '../../src/renderer/src/assets/images')
        : join(process.resourcesPath, 'app.asar.unpacked/src/renderer/src/assets/images')
      
      // Create directory if it doesn't exist
      if (!existsSync(imagesPath)) {
        mkdirSync(imagesPath, { recursive: true })
      }

      // Convert base64 to buffer and save
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const filePath = join(imagesPath, filename)
      
      writeFileSync(filePath, buffer)
      return { success: true, filename }
    } catch (error) {
      console.error('Failed to save image:', error)
      return { success: false, error: String(error) }
    }
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  db.closeDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
