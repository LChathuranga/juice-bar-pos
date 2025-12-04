import Header from './components/Header'
import Sidebar from './components/Sidebar'
import OrderSidebar from './components/OrderSidebar'
import AdminView from './components/admin/AdminView'
import { useState } from 'react'
import ItemsSection from './components/ItemsSection'

function App(): React.JSX.Element {
  const [category, setCategory] = useState<string>('all')
  const [query, setQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'pos' | 'admin'>('pos')

  const [orderItems, setOrderItems] = useState<{ id: string; qty: number; title: string; price: number }[]>([])

  // debug: log category changes
  // eslint-disable-next-line no-console
  console.log('App: current category', category)

  // If in admin mode, show admin view
  if (viewMode === 'admin') {
    return <AdminView onBackToPOS={() => setViewMode('pos')} />
  }

  // Otherwise show POS view
  return (
    <>
      <Header onAdminClick={() => setViewMode('admin')} />
      <div className="flex gap-6 h-[calc(100vh-64px)] bg-gray-200">
        <Sidebar active={category} onSelect={setCategory} />
        <main className="flex-1 pt-6 overflow-hidden">
          <div className="h-full overflow-auto">
            <div className="px-6 mb-6 flex justify-between gap-3">
              <span className="inline-block text-sm px-3 py-1 rounded bg-white shadow text-gray-600">Category: {category}</span>
              <div className="flex-1 max-w-md">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search drinks & add-ons..."
                  className="w-full py-2 px-6 rounded-full bg-white/70 border border-gray-300 focus:border-green-400 focus:ring-2 focus:ring-green-300 focus:outline-none transition"
                />
              </div>
            </div>
            <ItemsSection filter={category} query={query} onRequestAdd={(item, qty) => {
              setOrderItems((prev) => {
                const exists = prev.find((p) => p.id === item.id)
                if (exists) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p))
                return [...prev, { id: item.id, qty, title: item.title, price: item.price }]
              })
            }} />
          </div>
        </main>
        <div className="pr-6">
          <OrderSidebar orderItems={orderItems} setOrderItems={setOrderItems} />
        </div>
      </div>
    </>
  )
}

export default App
