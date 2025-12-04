import { FiSettings, FiLogOut, FiClock, FiUser } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useShopSettings } from '../../hooks/useShopSettings'

export default function Header({ 
  onAdminClick, 
  currentUser,
  userRole,
  onLogout 
}: { 
  onAdminClick?: () => void
  currentUser?: string
  userRole?: string
  onLogout?: () => void
}) {
  const { settings: shopSettings } = useShopSettings()
  const shopName = shopSettings?.name || 'Fresh Squeeze'
  const shopLogo = shopSettings?.logo || ''
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shopLogo ? (
              <img src={shopLogo} alt={shopName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C10.89 2 10 2.9 10 4s.89 2 2 2 2-.9 2-2-.89-2-2-2zM6 8c-.55 0-1 .45-1 1v6c0 3.31 2.69 6 6 6s6-2.69 6-6V9c0-.55-.45-1-1-1H6z" />
                </svg>
              </div>
            )}
            <div className="text-2xl font-semibold">{shopName}</div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-700">
            {/* Current Date & Time */}
            <div className="flex items-center gap-2 text-right bg-gray-50 px-4 py-2 rounded-lg">
              <FiClock className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium text-gray-800">
                  {currentTime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Current User */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <FiUser className="w-4 h-4 text-green-600" />
                <div className="text-right">
                  <div className="text-xs text-gray-500">Cashier</div>
                  <div className="font-medium text-gray-800">{currentUser}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onAdminClick && (
                <button
                  onClick={onAdminClick}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  title={userRole === 'admin' ? 'Admin Panel' : 'Login as Admin'}
                >
                  <FiSettings className="w-4 h-4" />
                  <span className="font-medium">
                    {userRole === 'admin' ? 'Admin' : 'Login to Admin'}
                  </span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
