import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as db from './database'

// Receipt width in mm
const RECEIPT_WIDTH_MM = 50

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Generate receipt HTML with tight layout for thermal printers
function generateReceiptHTML(receiptData: any, shopSettings: any): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Receipt</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${RECEIPT_WIDTH_MM}mm;margin:0;padding:0;background:#fff}
body{font-family:'Courier New',monospace;font-size:9px;line-height:1.2;padding:2mm;padding-bottom:0}
.header{text-align:center;padding-bottom:2mm;border-bottom:1px dashed #000;margin-bottom:1.5mm}
.shop-name{font-size:12px;font-weight:bold}
.shop-info{font-size:8px}
.order-info{font-size:8px;padding-bottom:1.5mm;margin-bottom:1.5mm;border-bottom:1px dashed #000}
.items{padding-bottom:1.5mm;margin-bottom:1.5mm;border-bottom:1px dashed #000}
.item{margin-bottom:1.5mm}
.item:last-child{margin-bottom:0}
.item-name{font-weight:bold;font-size:9px}
.item-details{display:flex;justify-content:space-between;font-size:8px}
.totals{margin-bottom:1.5mm}
.total-row{display:flex;justify-content:space-between;font-size:9px}
.total-row.grand{font-weight:bold;font-size:11px;border-top:1px solid #000;padding-top:1.5mm;margin-top:1.5mm}
.footer{text-align:center;padding-top:1.5mm;border-top:1px dashed #000;font-size:8px;padding-bottom:1mm}
@page{size:${RECEIPT_WIDTH_MM}mm auto;margin:0}
@media print{html,body{width:${RECEIPT_WIDTH_MM}mm}}
</style>
</head>
<body>
<div class="header">
<div class="shop-name">${receiptData.shopName || 'JUICE BAR POS'}</div>
<div class="shop-info">
${shopSettings.address ? `<div>${shopSettings.address}</div>` : '<div>Sri Lanka</div>'}
${shopSettings.phone ? `<div>Tel: ${shopSettings.phone}</div>` : ''}
</div>
</div>
<div class="order-info">
<div>Order: ${receiptData.orderNumber}</div>
<div>Date: ${receiptData.date}</div>
<div>Payment: ${receiptData.paymentMethod}</div>
</div>
<div class="items">
${receiptData.items.map((item: any) => `<div class="item">
<div class="item-name">${item.title}</div>
<div class="item-details">
<span>${item.qty} x Rs.${item.price.toFixed(2)}</span>
<span>Rs.${item.total.toFixed(2)}</span>
</div>
</div>`).join('')}
</div>
<div class="totals">
<div class="total-row"><span>Subtotal:</span><span>Rs.${receiptData.subtotal.toFixed(2)}</span></div>
${receiptData.discount > 0 ? `<div class="total-row"><span>Discount:</span><span>-Rs.${receiptData.discount.toFixed(2)}</span></div>` : ''}
${receiptData.tax > 0 ? `<div class="total-row"><span>Tax:</span><span>Rs.${receiptData.tax.toFixed(2)}</span></div>` : ''}
<div class="total-row grand"><span>TOTAL:</span><span>Rs.${receiptData.total.toFixed(2)}</span></div>
</div>
<div class="footer">
<p>Thank you!</p>
<p>Please come again</p>
</div>
</body>
</html>`
}

app.whenReady().then(() => {
  db.initDatabase()
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Product operations
  ipcMain.handle('db:getAllProducts', () => db.getAllProducts())
  ipcMain.handle('db:getProductById', (_, id: string) => db.getProductById(id))
  ipcMain.handle('db:createProduct', (_, product) => db.createProduct(product))
  ipcMain.handle('db:updateProduct', (_, id: string, updates) => db.updateProduct(id, updates))
  ipcMain.handle('db:deleteProduct', (_, id: string) => db.deleteProduct(id))

  // Order operations
  ipcMain.handle('db:createOrder', (_, order) => db.createOrder(order))
  ipcMain.handle('db:getOrders', (_, limit?: number, days?: number) => db.getOrders(limit, days))
  ipcMain.handle('db:getOrderItems', (_, orderId: number) => db.getOrderItems(orderId))

  // Sales analytics
  ipcMain.handle('db:getSalesReport', (_, days?: number) => db.getSalesReport(days))
  ipcMain.handle('db:getTotalRevenue', (_, days?: number) => db.getTotalRevenue(days))
  ipcMain.handle('db:getTotalOrders', (_, days?: number) => db.getTotalOrders(days))
  ipcMain.handle('db:getTopProducts', (_, limit?: number, days?: number) =>
    db.getTopProducts(limit, days)
  )

  // Category operations
  ipcMain.handle('db:getAllCategories', () => db.getAllCategories())
  ipcMain.handle('db:getCategoryById', (_, id: string) => db.getCategoryById(id))
  ipcMain.handle('db:createCategory', (_, category) => db.createCategory(category))
  ipcMain.handle('db:updateCategory', (_, id: string, updates) => db.updateCategory(id, updates))
  ipcMain.handle('db:deleteCategory', (_, id: string) => db.deleteCategory(id))

  // Shop Settings operations
  ipcMain.handle('db:getShopSettings', () => db.getShopSettings())
  ipcMain.handle('db:saveShopSettings', (_, settings) => db.saveShopSettings(settings))

  // Admin operations
  ipcMain.handle('db:getAllAdmins', () => db.getAllAdmins())
  ipcMain.handle('db:createAdmin', (_, admin) => db.createAdmin(admin))
  ipcMain.handle('db:deleteAdmin', (_, id: string) => db.deleteAdmin(id))
  ipcMain.handle(
    'db:changePassword',
    (_, username: string, currentPassword: string, newPassword: string) =>
      db.updateAdminPassword(username, currentPassword, newPassword)
  )
  ipcMain.handle('db:verifyAdmin', (_, username: string, password: string) =>
    db.verifyAdmin(username, password)
  )

  // Migration/Reset operations
  ipcMain.handle('db:clearAllTables', () => db.clearAllTables())
  ipcMain.handle('db:resetToDefaults', () => db.resetToDefaults())

  // Image operations - save to userData folder in production
  ipcMain.handle('save-product-image', (_, imageData: string, filename: string) => {
    try {
      // In dev: save to src folder, In production: save to userData folder
      const imagesPath = is.dev
        ? join(__dirname, '../../src/renderer/src/assets/images')
        : join(app.getPath('userData'), 'product-images')

      if (!existsSync(imagesPath)) {
        mkdirSync(imagesPath, { recursive: true })
      }

      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const filePath = join(imagesPath, filename)

      writeFileSync(filePath, buffer)
      
      // Return the full path for production, filename for dev
      const imagePath = is.dev ? filename : filePath
      return { success: true, filename, imagePath }
    } catch (error) {
      console.error('Failed to save image:', error)
      return { success: false, error: String(error) }
    }
  })

  // Get product image path for loading images
  ipcMain.handle('get-product-image-path', (_, filename: string) => {
    if (is.dev) {
      return null // Use relative path in dev
    }
    // In production, return full file path
    const imagePath = join(app.getPath('userData'), 'product-images', filename)
    if (existsSync(imagePath)) {
      return `file://${imagePath.replace(/\\/g, '/')}`
    }
    return null
  })

  // Get the base path for product images
  ipcMain.handle('get-images-base-path', () => {
    if (is.dev) {
      return null
    }
    return `file://${join(app.getPath('userData'), 'product-images').replace(/\\/g, '/')}`
  })

  // Print receipt - direct print with custom page size
  ipcMain.handle('print-receipt', async (_, receiptData) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const shopSettings = db.getShopSettings()

        // Calculate height based on content (in mm)
        const itemCount = receiptData.items.length
        const hasDiscount = receiptData.discount > 0
        const hasTax = receiptData.tax > 0

        // Height calculation with larger fonts
        const headerHeight = 14
        const orderInfoHeight = 12
        const itemHeight = itemCount * 8
        const totalsHeight = 14 + (hasDiscount ? 5 : 0) + (hasTax ? 5 : 0)
        const footerHeight = 10
        const padding = 4

        const totalHeightMM = headerHeight + orderInfoHeight + itemHeight + totalsHeight + footerHeight + padding

        const receiptHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
@page{size:${RECEIPT_WIDTH_MM}mm ${totalHeightMM}mm;margin:0}
@media print{html,body{width:${RECEIPT_WIDTH_MM}mm!important;height:auto!important;margin:0!important;padding:0!important}}
html,body{width:${RECEIPT_WIDTH_MM}mm;margin:0;padding:0}
body{font-family:'Courier New',monospace;font-size:11px;line-height:1.2;padding:2mm 3mm}
.header{text-align:center;padding-bottom:1.5mm;border-bottom:1px dashed #000;margin-bottom:1.5mm}
.shop-name{font-size:14px;font-weight:bold}
.shop-info{font-size:11px}
.order-info{font-size:11px;padding-bottom:1.5mm;margin-bottom:1.5mm;border-bottom:1px dashed #000}
.order-info div{margin:0.5mm 0}
.items{padding-bottom:1.5mm;margin-bottom:1.5mm;border-bottom:1px dashed #000}
.item{margin-bottom:1.2mm}
.item:last-child{margin-bottom:0}
.item-name{font-weight:bold;font-size:12px}
.item-details{display:flex;justify-content:space-between;font-size:11px}
.totals{margin-bottom:1mm}
.total-row{display:flex;justify-content:space-between;font-size:12px;margin:0.5mm 0}
.total-row.grand{font-weight:bold;font-size:13px;border-top:1px solid #000;padding-top:1mm;margin-top:1mm}
.footer{text-align:center;padding-top:1mm;border-top:1px dashed #000;font-size:11px}
.footer p{margin:0.5mm 0}
</style>
</head>
<body>
<div class="header">
<div class="shop-name">${receiptData.shopName || 'JUICE BAR POS'}</div>
<div class="shop-info">
${shopSettings.address ? `<div>${shopSettings.address}</div>` : '<div>Sri Lanka</div>'}
${shopSettings.phone ? `<div>Tel: ${shopSettings.phone}</div>` : ''}
</div>
</div>
<div class="order-info">
<div>Order: ${receiptData.orderNumber}</div>
<div>Date: ${receiptData.date}</div>
<div>Payment: ${receiptData.paymentMethod}</div>
</div>
<div class="items">
${receiptData.items.map((item: any) => `<div class="item"><div class="item-name">${item.title}</div><div class="item-details"><span>${item.qty} x Rs.${item.price.toFixed(2)}</span><span>Rs.${item.total.toFixed(2)}</span></div></div>`).join('')}
</div>
<div class="totals">
<div class="total-row"><span>Subtotal:</span><span>Rs.${receiptData.subtotal.toFixed(2)}</span></div>
${receiptData.discount > 0 ? `<div class="total-row"><span>Discount:</span><span>-Rs.${receiptData.discount.toFixed(2)}</span></div>` : ''}
${receiptData.tax > 0 ? `<div class="total-row"><span>Tax:</span><span>Rs.${receiptData.tax.toFixed(2)}</span></div>` : ''}
<div class="total-row grand"><span>TOTAL:</span><span>Rs.${receiptData.total.toFixed(2)}</span></div>
</div>
<div class="footer">
<p>Thank you!</p>
<p>Please come again</p>
</div>
</body>
</html>`

        const widthMicrons = RECEIPT_WIDTH_MM * 1000
        const heightMicrons = totalHeightMM * 1000

        const printWindow = new BrowserWindow({
          show: false,
          width: Math.round((RECEIPT_WIDTH_MM / 25.4) * 96),
          height: Math.round((totalHeightMM / 25.4) * 96),
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
          }
        })

        printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHTML)}`)

        printWindow.webContents.on('did-finish-load', () => {
          // Print immediately without delay
          printWindow.webContents.print(
            {
              silent: true,
              printBackground: false,
              margins: { marginType: 'none' },
              pageSize: {
                width: widthMicrons,
                height: heightMicrons
              }
            },
            (success, errorType) => {
              printWindow.close()
              if (success) {
                resolve()
              } else {
                console.error('Print failed:', errorType)
                reject(new Error(`Print failed: ${errorType}`))
              }
            }
          )
        })

        printWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
          printWindow.close()
          reject(new Error(`Failed to load: ${errorDescription} (${errorCode})`))
        })
      } catch (error) {
        reject(error)
      }
    })
  })

  // Print receipt with preview (for debugging)
  ipcMain.handle('print-receipt-preview', async (_, receiptData) => {
    return new Promise<void>((resolve) => {
      const shopSettings = db.getShopSettings()
      const receiptHTML = generateReceiptHTML(receiptData, shopSettings)

      const previewWindow = new BrowserWindow({
        show: true,
        width: 280,
        height: 600,
        title: 'Receipt Preview',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      previewWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHTML)}`)
      previewWindow.webContents.on('did-finish-load', () => {
        resolve()
      })
    })
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  db.closeDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
