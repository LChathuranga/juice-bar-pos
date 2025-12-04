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

  // Shop Settings operations
  ipcMain.handle('db:getShopSettings', () => {
    return db.getShopSettings()
  })

  ipcMain.handle('db:saveShopSettings', (_, settings) => {
    return db.saveShopSettings(settings)
  })

  // Admin operations
  ipcMain.handle('db:getAllAdmins', () => {
    return db.getAllAdmins()
  })

  ipcMain.handle('db:createAdmin', (_, admin) => {
    return db.createAdmin(admin)
  })

  ipcMain.handle('db:deleteAdmin', (_, id: string) => {
    return db.deleteAdmin(id)
  })

  ipcMain.handle('db:changePassword', (_, username: string, currentPassword: string, newPassword: string) => {
    return db.updateAdminPassword(username, currentPassword, newPassword)
  })

  ipcMain.handle('db:verifyAdmin', (_, username: string, password: string) => {
    return db.verifyAdmin(username, password)
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

  // Print operations
  ipcMain.handle('print-receipt', async (_, receiptData) => {
    return new Promise<void>(async (resolve, reject) => {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) {
        reject(new Error('No focused window'))
        return
      }

      // Get shop settings for receipt header
      const shopSettings = db.getShopSettings()

      // Create receipt HTML content
      const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt ${receiptData.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              max-width: 80mm;
              margin: 0 auto;
              padding: 5mm;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0 0 5px 0;
              font-size: 18px;
            }
            .header p {
              margin: 2px 0;
              font-size: 11px;
            }
            .order-info {
              margin: 10px 0;
              font-size: 11px;
              line-height: 1.4;
            }
            .order-info div {
              margin: 2px 0;
            }
            .items {
              margin: 10px 0;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .item {
              margin: 5px 0;
              font-size: 11px;
            }
            .item-title {
              font-weight: bold;
            }
            .item-details {
              display: flex;
              justify-content: space-between;
              color: #666;
            }
            .totals {
              margin-top: 10px;
              font-size: 11px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .total-row.grand {
              font-weight: bold;
              font-size: 13px;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 2px solid #000;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              padding-top: 10px;
              border-top: 2px dashed #000;
              font-size: 10px;
              line-height: 1.4;
            }
            .footer p {
              margin: 3px 0;
            }
            @page { 
              margin: 0; 
              size: 80mm auto; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${shopSettings.name || 'JUICE BAR POS'}</h1>
            ${shopSettings.address ? `<p>${shopSettings.address}</p>` : '<p>Sri Lanka</p>'}
            ${shopSettings.phone ? `<p>Tel: ${shopSettings.phone}</p>` : ''}
          </div>
          <div class="order-info">
            <div>Order: ${receiptData.orderNumber}</div>
            <div>Date: ${receiptData.date}</div>
            <div>Payment: ${receiptData.paymentMethod}</div>
          </div>
          <div class="items">
            ${receiptData.items.map(item => `
              <div class="item">
                <div class="item-title">${item.title}</div>
                <div class="item-details">
                  <span>${item.qty} x ${item.price.toFixed(2)}</span>
                  <span>Rs. ${item.total.toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>Rs. ${receiptData.subtotal.toFixed(2)}</span>
            </div>
            ${receiptData.discount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>- Rs. ${receiptData.discount.toFixed(2)}</span>
            </div>` : ''}
            ${receiptData.tax > 0 ? `
            <div class="total-row">
              <span>Tax:</span>
              <span>Rs. ${receiptData.tax.toFixed(2)}</span>
            </div>` : ''}
            <div class="total-row grand">
              <span>TOTAL:</span>
              <span>Rs. ${receiptData.total.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Please come again</p>
          </div>
        </body>
        </html>
      `

      // Create a hidden window for printing
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptContent)}`)

      printWindow.webContents.on('did-finish-load', () => {
        // Print silently to default printer
        printWindow.webContents.print(
          {
            silent: true,
            printBackground: true,
            margins: {
              marginType: 'none'
            }
          },
          (success, errorType) => {
            if (!success) {
              console.error('Print failed:', errorType)
              reject(new Error(`Print failed: ${errorType}`))
            } else {
              console.log('Print successful')
              resolve()
            }
            printWindow.close()
          }
        )
      })
    })
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
