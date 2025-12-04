import { useState } from 'react'
import { FiLogOut } from 'react-icons/fi'
import AdminSidebar from './AdminSidebar'
import ProductManagement from './ProductManagement'
import CategoryManagement from './CategoryManagement'
import SalesReport from './SalesReport'
import Settings from './Settings'
import { useShopSettings } from '../../hooks/useShopSettings'

export default function AdminView({ onBackToPOS, onLogout }: { onBackToPOS: () => void; onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState<string>('products')
  const { settings: shopSettings } = useShopSettings()
  const shopName = shopSettings?.name || 'Juice Bar POS'

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <span className="text-sm opacity-80">{shopName}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPOS}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Back to POS
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar active={activeSection} onSelect={setActiveSection} />
        
        <main className="flex-1 overflow-auto p-6">
          {activeSection === 'products' && <ProductManagement />}
          {activeSection === 'sales' && <SalesReport />}
          {activeSection === 'categories' && <CategoryManagement />}
          {activeSection === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}
