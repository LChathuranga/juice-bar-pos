import { useState, useEffect } from 'react'
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi'

type Product = {
  id: string
  title: string
  category: string
  price: number
  image?: string
  created_at?: string
  updated_at?: string
}

const getImageUrl = (imageName: string) => {
  return new URL(`../../assets/images/${imageName}`, import.meta.url).href
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({ title: '', category: 'cold-press', price: '' })
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('green.jpg')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await window.api.getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setFormData({ title: '', category: 'cold-press', price: '' })
    setSelectedImage('green.jpg')
    setImagePreview(null)
    setShowModal(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      category: product.category,
      price: product.price.toString()
    })
    setSelectedImage(product.image || 'green.jpg')
    setImagePreview(null)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await window.api.deleteProduct(id)
        await loadProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
        alert('Failed to delete product')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingProduct) {
        // Update existing product
        await window.api.updateProduct(editingProduct.id, {
          title: formData.title,
          category: formData.category,
          price: parseFloat(formData.price),
          image: selectedImage
        })
      } else {
        // Add new product
        await window.api.createProduct({
          id: Date.now().toString(),
          title: formData.title,
          category: formData.category,
          price: parseFloat(formData.price),
          image: selectedImage
        })
      }
      
      await loadProducts()
      setShowModal(false)
      setFormData({ title: '', category: 'cold-press', price: '' })
      setSelectedImage('green.jpg')
      setImagePreview(null)
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('Failed to save product')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-600">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
          <p className="text-gray-600 mt-1">Manage your menu items</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-purple-50 rounded-full mb-4">
              <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first product to the menu.</p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Image</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Product Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Price</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                      {product.image && (
                        <img src={getImageUrl(product.image)} alt={product.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{product.title}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">${product.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                {editingProduct ? 'Edit Product' : 'Add New Product'}
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
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="cold-press">Cold Press</option>
                    <option value="smoothies">Smoothies</option>
                    <option value="shots">Shots</option>
                    <option value="add-ons">Add-Ons</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedImage('green.jpg')}
                      className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                        selectedImage === 'green.jpg'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="aspect-square rounded bg-gray-100 mb-2 overflow-hidden">
                        <img src={getImageUrl('green.jpg')} alt="Green" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium">Green</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImage('berry.jpg')}
                      className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                        selectedImage === 'berry.jpg'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="aspect-square rounded bg-gray-100 mb-2 overflow-hidden">
                        <img src={getImageUrl('berry.jpg')} alt="Berry" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium">Berry</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select an image for your product
                  </p>
                </div>
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
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
