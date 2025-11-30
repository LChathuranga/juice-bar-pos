import Header from './components/Header'
import Sidebar from './components/Sidebar'
import OrderSidebar from './components/OrderSidebar'
import { useState } from 'react'
import ItemsSection from './components/ItemsSection'

function App(): React.JSX.Element {
  const [category, setCategory] = useState<string>('all')

  // debug: log category changes
  // eslint-disable-next-line no-console
  console.log('App: current category', category)

  return (
    <>
      <Header />
      <div className="flex gap-6 h-[calc(100vh-64px)] bg-gray-200">
        <Sidebar active={category} onSelect={setCategory} />
        <main className="flex-1 pt-6 overflow-hidden">
          <div className="h-full overflow-auto">
            <div className="px-6 mb-4">
              <span className="inline-block text-sm px-3 py-1 rounded bg-white shadow text-gray-600">Category: {category}</span>
            </div>
            <ItemsSection filter={category} />
          </div>
        </main>
        <div className="pr-6">
          <OrderSidebar />
        </div>
      </div>
    </>
  )
}

export default App
