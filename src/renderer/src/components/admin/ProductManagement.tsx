import { useState, useEffect } from 'react'
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi'
import { Product, Category } from '../../types'

// Cache for image paths
const imagePathCache: Record<string, string> = {}

// Component to handle async image loading
function ProductImage({ imageName, alt, className }: { imageName?: string; alt: string; className: string }) {
  const [src, setSrc] = useState<string>('')

  useEffect(() => {
    if (!imageName) {
      setSrc('')
      return
    }

    // Check cache first
    if (imagePathCache[imageName]) {
      setSrc(imagePathCache[imageName])
      return
    }

    // Load image path
    const loadImage = async () => {
      // Try production path first
      const productionPath = await window.api.getProductImagePath(imageName)
      if (productionPath) {
        imagePathCache[imageName] = productionPath
        setSrc(productionPath)
        return
      }

      // Fallback to dev path
      try {
        const url = new URL(`../../assets/images/${imageName}`, import.meta.url).href
        imagePathCache[imageName] = url
        setSrc(url)
      } catch {
        setSrc('')
      }
    }

    loadImage()
  }, [imageName])

  if (!src) {
    return <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400`}>No Image</div>
  }

  return <img src={src} alt={alt} className={className} />
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({ title: '', category: '', price: '' })
  const [loading, setLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
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

  const loadCategories = async () => {
    try {
      const data = await window.api.getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setFormData({ title: '', category: categories[0]?.id || '', price: '' })
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(false)
    setShowModal(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      category: product.category,
      price: product.price.toString()
    })
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(false)
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

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedProducts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedProducts.size === 0) {
      alert('No products selected')
      return
    }

    if (confirm(`Are you sure you want to delete ${selectedProducts.size} product(s)?`)) {
      try {
        await Promise.all(
          Array.from(selectedProducts).map(id => window.api.deleteProduct(id))
        )
        setSelectedProducts(new Set())
        await loadProducts()
      } catch (error) {
        console.error('Failed to delete products:', error)
        alert('Failed to delete products')
      }
    }
  }

  const handleDeleteAll = async () => {
    if (products.length === 0) {
      alert('No products to delete')
      return
    }

    if (confirm(`Are you sure you want to delete ALL ${products.length} product(s)? This cannot be undone!`)) {
      try {
        await Promise.all(
          products.map(p => window.api.deleteProduct(p.id))
        )
        setSelectedProducts(new Set())
        await loadProducts()
      } catch (error) {
        console.error('Failed to delete all products:', error)
        alert('Failed to delete all products')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let imageName: string | undefined = undefined
      
      // If user uploaded a new image, save it
      if (imageFile && imagePreview) {
        const ext = imageFile.name.split('.').pop()
        imageName = `${Date.now()}.${ext}`
        
        // Save image to assets/images folder via IPC
        const result = await window.api.saveProductImage(imagePreview, imageName)
        
        if (!result.success) {
          alert('Failed to save image: ' + result.error)
          return
        }
      }
      
      if (editingProduct) {
        // Update existing product
        const updates: any = {
          title: formData.title,
          category: formData.category,
          price: parseFloat(formData.price)
        }
        // Handle image update/removal
        if (imageName) {
          updates.image = imageName
        } else if (removeImage) {
          updates.image = null
        }
        await window.api.updateProduct(editingProduct.id, updates)
      } else {
        // Add new product
        await window.api.createProduct({
          id: Date.now().toString(),
          title: formData.title,
          category: formData.category,
          price: parseFloat(formData.price),
          image: imageName
        })
      }
      
      await loadProducts()
      setShowModal(false)
      setFormData({ title: '', category: 'cold-press', price: '' })
      setImageFile(null)
      setImagePreview(null)
      setRemoveImage(false)
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
          {selectedProducts.size > 0 && (
            <p className="text-sm text-purple-600 mt-1">{selectedProducts.size} product(s) selected</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedProducts.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiTrash2 className="w-5 h-5" />
              Delete Selected ({selectedProducts.size})
            </button>
          )}
          {products.length > 0 && (
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
            Add Product
          </button>
        </div>
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
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedProducts.size === products.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </th>
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
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => handleToggleSelect(product.id)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      {product.image ? (
                        <ProductImage imageName={product.image} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.5,8.5c-1.333,0-2.5-0.5-3.5-1.5c-1,1-2.167,1.5-3.5,1.5S11,8,10,7C9,8,7.833,8.5,6.5,8.5S4,8,3,7v11c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V7C20,8,19.167,8.5,20.5,8.5z M7,17H5v-2h2V17z M7,13H5v-2h2V13z M11,17H9v-2h2V17z M11,13H9v-2h2V13z M15,17h-2v-2h2V17z M15,13h-2v-2h2V13z M19,17h-2v-2h2V17z M19,13h-2v-2h2V13z" opacity=".3"/>
                          <path d="M3,2v4c1,1,2,1.5,3.5,1.5S9,7,10,6c1,1,2.5,1.5,4,1.5s3-0.5,4-1.5c1,1,2,1.5,3.5,1.5S23,7,24,6V2H3z M19,20H5V9c-1.667,0-3,0.667-4,2v11c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V11c-1,1.333-2.333,2-4,2V20z"/>
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{product.title}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">Rs. {product.price.toFixed(2)}</td>
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
                    required
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-purple-600">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : editingProduct && editingProduct.image && !removeImage ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                        <ProductImage imageName={editingProduct.image} alt="Current" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setRemoveImage(true)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Remove image"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">No image selected</p>
                        </div>
                      </div>
                    )}
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </span>
                      </label>
                    </label>
                    <p className="text-xs text-gray-500">
                      Select an image from your computer (JPG, PNG, GIF, WebP)
                    </p>
                  </div>
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
