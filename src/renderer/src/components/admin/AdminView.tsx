import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import ProductManagement from './ProductManagement'
import SalesReport from './SalesReport'

export default function AdminView({ onBackToPOS }: { onBackToPOS: () => void }) {
  const [activeSection, setActiveSection] = useState<string>('products')

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <span className="text-sm opacity-80">Juice Bar POS</span>
          </div>
          <button
            onClick={onBackToPOS}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Back to POS
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar active={activeSection} onSelect={setActiveSection} />
        
        <main className="flex-1 overflow-auto p-6">
          {activeSection === 'products' && <ProductManagement />}
          {activeSection === 'sales' && <SalesReport />}
          {activeSection === 'categories' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Category Management</h2>
              <p className="text-gray-600">Category management features coming soon...</p>
            </div>
          )}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
              <p className="text-gray-600">Settings features coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
