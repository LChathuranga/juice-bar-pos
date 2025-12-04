import { FiPackage, FiBarChart2, FiGrid, FiSettings } from 'react-icons/fi'

export default function AdminSidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const sections = [
    { id: 'products', label: 'Products', icon: <FiPackage className="w-5 h-5" /> },
    { id: 'sales', label: 'Sales Reports', icon: <FiBarChart2 className="w-5 h-5" /> },
    { id: 'categories', label: 'Categories', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ]

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-700">Admin Menu</h2>
      </div>
      
      <nav className="px-3">
        {sections.map((section) => {
          const isActive = active === section.id
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={isActive ? 'text-white' : 'text-gray-600'}>
                {section.icon}
              </div>
              <span className="font-medium">{section.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
