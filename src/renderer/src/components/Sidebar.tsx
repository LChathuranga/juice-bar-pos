import React from 'react'
import { FiDroplet, FiCoffee, FiPlusCircle, FiActivity } from 'react-icons/fi'

export default function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {

  const categories = [
    { id: 'all', label: 'All', icon: <FiActivity className="w-5 h-5" /> },
    { id: 'cold-press', label: 'Cold Press', icon: <FiDroplet className="w-5 h-5" /> },
    { id: 'smoothies', label: 'Smoothies', icon: <FiCoffee className="w-5 h-5" /> },
    { id: 'shots', label: 'Shots', icon: <FiActivity className="w-5 h-5" /> },
    { id: 'add-ons', label: 'Add-Ons', icon: <FiPlusCircle className="w-5 h-5" /> },
  ]

  return (
    <aside className="w-60 bg-white shadow-sm border-r border-transparent h-[calc(100vh-64px)] overflow-auto">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-center text-2xl font-extrabold text-emerald-400">Fresh Squeeze</h1>
      </div>

      <div className="px-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Categories</h3>
      </div>

      <nav className="mt-3 px-2 space-y-2 pb-6">
        {categories.map((c) => {
          const isActive = active === c.id
          return (
            <button
              type="button"
              key={c.id}
              onClick={() => {
                // debug: ensure handler is called
                // eslint-disable-next-line no-console
                console.log('Sidebar: select', c.id)
                if (onSelect) onSelect(c.id)
              }}
              aria-pressed={isActive}
              className={`w-full flex items-center gap-3 transition-colors duration-150 focus:outline-none ${isActive ? 'bg-rose-400 text-white rounded-full px-4 py-2' : 'text-gray-700 hover:bg-gray-50 px-2 py-2 rounded-md'}`}
            >
              <div className={`flex-shrink-0 ${isActive ? 'bg-white rounded-full p-1' : ''}`}>
                {React.cloneElement(c.icon as any, { color: isActive ? '#ef4444' : '#111827' })}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-800'}`}>{c.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
