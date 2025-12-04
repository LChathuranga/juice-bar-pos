import { useState, useEffect } from 'react'
import { FiEdit2, FiTrash2, FiPlus, FiX, FiDroplet, FiCoffee, FiActivity, FiPlusCircle, FiZap, FiSun, FiMoon, FiStar } from 'react-icons/fi'
import { Category } from '../../types'

const availableIcons = [
  { name: 'FiDroplet', component: FiDroplet, label: 'Droplet' },
  { name: 'FiCoffee', component: FiCoffee, label: 'Coffee' },
  { name: 'FiActivity', component: FiActivity, label: 'Activity' },
  { name: 'FiPlusCircle', component: FiPlusCircle, label: 'Plus Circle' },
  { name: 'FiZap', component: FiZap, label: 'Zap' },
  { name: 'FiSun', component: FiSun, label: 'Sun' },
  { name: 'FiMoon', component: FiMoon, label: 'Moon' },
  { name: 'FiStar', component: FiStar, label: 'Star' }
]

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ id: '', name: '', icon: 'FiActivity' })
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await window.api.getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({ id: '', name: '', icon: 'FiActivity' })
    setShowModal(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      id: category.id,
      name: category.name,
      icon: category.icon || 'FiActivity'
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? Products using this category may be affected.')) {
      try {
        await window.api.deleteCategory(id)
        await loadCategories()
      } catch (error) {
        console.error('Failed to delete category:', error)
        alert('Failed to delete category')
      }
    }
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCategories(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(categories.map(c => c.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedCategories.size === 0) {
      alert('No categories selected')
      return
    }

    if (confirm(`Are you sure you want to delete ${selectedCategories.size} category(ies)?`)) {
      try {
        await Promise.all(
          Array.from(selectedCategories).map(id => window.api.deleteCategory(id))
        )
        setSelectedCategories(new Set())
        await loadCategories()
      } catch (error) {
        console.error('Failed to delete categories:', error)
        alert('Failed to delete categories')
      }
    }
  }

  const handleDeleteAll = async () => {
    if (categories.length === 0) {
      alert('No categories to delete')
      return
    }

    if (confirm(`Are you sure you want to delete ALL ${categories.length} category(ies)? This cannot be undone!`)) {
      try {
        await Promise.all(
          categories.map(c => window.api.deleteCategory(c.id))
        )
        setSelectedCategories(new Set())
        await loadCategories()
      } catch (error) {
        console.error('Failed to delete all categories:', error)
        alert('Failed to delete all categories')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        // Update existing category
        await window.api.updateCategory(editingCategory.id, {
          name: formData.name,
          icon: formData.icon
        })
      } else {
        // Add new category - generate ID from name
        const id = formData.name.toLowerCase().replace(/\s+/g, '-')
        await window.api.createCategory({
          id,
          name: formData.name,
          icon: formData.icon
        })
      }
      
      await loadCategories()
      setShowModal(false)
      setFormData({ id: '', name: '', icon: 'FiActivity' })
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-600">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
          <p className="text-gray-600 mt-1">Manage product categories</p>
          {selectedCategories.size > 0 && (
            <p className="text-sm text-purple-600 mt-1">{selectedCategories.size} category(ies) selected</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedCategories.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiTrash2 className="w-5 h-5" />
              Delete Selected ({selectedCategories.size})
            </button>
          )}
          {categories.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FiTrash2 className="w-5 h-5" />
              Delete All
            </button>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      </div>

      <div className="p-6">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-purple-50 rounded-full mb-4">
              <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first product category.</p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                    <input
                      type="checkbox"
                      checked={categories.length > 0 && selectedCategories.size === categories.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Icon</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">ID</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Category Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Created At</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const iconData = availableIcons.find(i => i.name === category.icon)
                  const IconComponent = iconData?.component || FiActivity
                  
                  return (
                    <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedCategories.has(category.id)}
                          onChange={() => handleToggleSelect(category.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
                          <IconComponent className="w-5 h-5 text-purple-600" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
                          {category.id}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{category.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter category name"
                    required
                  />
                  {!editingCategory && formData.name && (
                    <p className="text-xs text-gray-500 mt-1">
                      ID will be: <span className="font-mono">{formData.name.toLowerCase().replace(/\s+/g, '-')}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Icon
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableIcons.map((icon) => {
                      const IconComponent = icon.component
                      const isSelected = formData.icon === icon.name
                      return (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: icon.name })}
                          className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all hover:border-purple-400 ${
                            isSelected 
                              ? 'border-purple-600 bg-purple-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          title={icon.label}
                        >
                          <IconComponent className={`w-6 h-6 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                          <span className={`text-xs mt-1 ${isSelected ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                            {icon.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {editingCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category ID
                    </label>
                    <input
                      type="text"
                      value={editingCategory.id}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Category ID cannot be changed</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
