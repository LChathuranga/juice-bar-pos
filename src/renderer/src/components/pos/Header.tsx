import { FiSettings } from 'react-icons/fi'
import { useState, useEffect } from 'react'

export default function Header({ onAdminClick }: { onAdminClick?: () => void }) {
  const [shopName, setShopName] = useState('Fresh Squeeze')
  const [shopLogo, setShopLogo] = useState('')

  useEffect(() => {
    loadShopSettings()
  }, [])

  const loadShopSettings = async () => {
    try {
      const settings = await window.api.getShopSettings()
      if (settings) {
        if (settings.name) {
          setShopName(settings.name)
        }
        // Logo is stored as base64 data URL
        if (settings.logo) {
          setShopLogo(settings.logo)
        }
      }
    } catch (error) {
      console.error('Failed to load shop settings:', error)
    }
  }

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

          <div className="flex items-center gap-8 text-sm text-gray-700">
            <div className="text-right">
              <div className="font-medium">Barists: Alex</div>
              <div className="text-xs text-gray-400">Zed 7:08 11/05/23</div>
            </div>
            <div className="text-right">
              <div className="font-medium">Becits: 11:28 am</div>
              <div className="text-xs text-gray-400">09.11.8: A10</div>
            </div>
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Admin Panel"
              >
                <FiSettings className="w-4 h-4" />
                <span className="font-medium">Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
