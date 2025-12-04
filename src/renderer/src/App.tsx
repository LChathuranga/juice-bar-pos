import Header from './components/pos/Header'
import Sidebar from './components/pos/Sidebar'
import OrderSidebar from './components/pos/OrderSidebar'
import AdminView from './components/admin/AdminView'
import Login from './components/Login'
import { useState } from 'react'
import ItemsSection from './components/pos/ItemsSection'
import { CartItem } from './types'

function App(): React.JSX.Element {
  const [category, setCategory] = useState<string>('all')
  const [query, setQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'pos' | 'admin'>('pos')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  const [loginMode, setLoginMode] = useState<'pos' | 'admin'>('pos')

  const [orderItems, setOrderItems] = useState<CartItem[]>([])

  // debug: log category changes
  // eslint-disable-next-line no-console
  console.log('App: current category', category)

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await window.api.verifyAdmin(username, password)
      if (result.valid) {
        setIsAuthenticated(true)
        setCurrentUser(result.username || username)
        setUserRole(result.role || 'cashier')
        setViewMode(loginMode)
        // Store current logged in username for password changes
        sessionStorage.setItem('currentUser', result.username || username)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const handleAdminClick = () => {
    // If cashier, prompt to re-login as admin
    if (userRole !== 'admin') {
      if (confirm('You need to login with an admin account to access the admin panel. Would you like to logout and login as admin?')) {
        setIsAuthenticated(false)
        setCurrentUser('')
        setUserRole('')
        setViewMode('pos')
        setLoginMode('admin') // Set to admin mode before logout
        sessionStorage.removeItem('currentUser')
      }
      return
    }
    // If already admin, just switch to admin view
    setLoginMode('admin')
    setViewMode('admin')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser('')
    setUserRole('')
    setViewMode('pos')
    setLoginMode('pos') // Reset login mode to POS
    sessionStorage.removeItem('currentUser')
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} mode={loginMode} />
  }

  // If in admin mode, show admin view
  if (viewMode === 'admin') {
    return <AdminView onBackToPOS={() => setViewMode('pos')} onLogout={handleLogout} />
  }

  // Otherwise show POS view
  return (
    <>
      <Header 
        onAdminClick={handleAdminClick} 
        currentUser={currentUser}
        userRole={userRole}
        onLogout={handleLogout} 
      />
      <div className="flex gap-6 h-[calc(100vh-64px)] bg-gray-200">
        <Sidebar active={category} onSelect={setCategory} />
        <main className="flex-1 pt-6 overflow-hidden">
          <div className="h-full overflow-auto">
            <div className="px-6 mb-6 flex justify-end gap-3">
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
