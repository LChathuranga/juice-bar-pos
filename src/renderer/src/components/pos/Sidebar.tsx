import React, { useState, useEffect } from 'react'
import { FiDroplet, FiCoffee, FiPlusCircle, FiActivity, FiZap, FiSun, FiMoon, FiStar } from 'react-icons/fi'
import { Category } from '../../types'

export default function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await window.api.getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const getCategoryIcon = (iconName?: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      'FiDroplet': <FiDroplet className="w-5 h-5" />,
      'FiCoffee': <FiCoffee className="w-5 h-5" />,
      'FiActivity': <FiActivity className="w-5 h-5" />,
      'FiPlusCircle': <FiPlusCircle className="w-5 h-5" />,
      'FiZap': <FiZap className="w-5 h-5" />,
      'FiSun': <FiSun className="w-5 h-5" />,
      'FiMoon': <FiMoon className="w-5 h-5" />,
      'FiStar': <FiStar className="w-5 h-5" />,
    }
    return iconMap[iconName || 'FiActivity'] || <FiActivity className="w-5 h-5" />
  }

  const allCategories = [
    { id: 'all', name: 'All', icon: <FiActivity className="w-5 h-5" /> },
    ...categories.map(cat => ({ ...cat, icon: getCategoryIcon(cat.icon) }))
  ]

  return (
    <aside className="w-70 bg-white shadow-sm border-r-2 border-gray-200 h-[calc(100vh-90px)] overflow-auto mt-4 rounded-lg">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h1 className="text-center text-2xl font-extrabold text-green-600">Categories</h1>
      </div>

      <nav className="mt-3 px-2 divide-y divide-gray-100 pb-6">
        {allCategories.map((c) => {
          const isActive = active === c.id
          return (
            <div key={c.id} className="py-2">
              <button
                type="button"
                onClick={() => {
                  // debug: ensure handler is called
                  // eslint-disable-next-line no-console
                  console.log('Sidebar: select', c.id)
                  if (onSelect) onSelect(c.id)
                }}
                aria-pressed={isActive}
                className={`w-full flex items-center gap-3 transition-colors duration-150 focus:outline-none ${isActive ? 'bg-green-600 text-white rounded-full px-4 py-2' : 'text-gray-700 hover:bg-gray-50 px-2 py-2 rounded-md'}`}
              >
                <div className={`flex-shrink-0 ${isActive ? 'bg-white rounded-full p-1' : ''}`}>
                  {React.cloneElement(c.icon as any, { color: isActive ? '#16a34a' : '#111827' })}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-800'}`}>{c.name}</span>
              </button>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
