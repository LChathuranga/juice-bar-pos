import { useState, useEffect } from 'react'
import { FiUser, FiLock, FiSettings, FiImage, FiSave, FiPlus, FiTrash2, FiEdit2, FiDatabase } from 'react-icons/fi'
import { Admin, ShopSettings } from '../../types'

interface NewAdmin {
  username: string
  password: string
  confirmPassword: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'shop' | 'admins' | 'security' | 'database'>('shop')
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    id: 1,
    name: 'Juice Bar POS',
    logo: '',
    address: '',
    phone: '',
    updated_at: ''
  })
  const [admins, setAdmins] = useState<Admin[]>([])
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({ username: '', password: '', confirmPassword: '' })
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSettings()
    loadAdmins()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await window.api.getShopSettings()
      if (settings) {
        setShopSettings(settings)
        // Logo is stored as base64 data URL
        if (settings.logo) {
          setLogoPreview(settings.logo)
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadAdmins = async () => {
    try {
      const adminList = await window.api.getAllAdmins()
      setAdmins(adminList)
    } catch (error) {
      console.error('Failed to load admins:', error)
    }
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogoPreview(base64String)
        setShopSettings(prev => ({ ...prev, logo: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveShopSettings = async () => {
    setSaving(true)
    setMessage(null)
    try {
      // Logo is already in base64 format, save directly to database
      await window.api.saveShopSettings(shopSettings)
      setMessage({ type: 'success', text: 'Shop settings saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddAdmin = async () => {
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (newAdmin.username.length < 3 || newAdmin.password.length < 6) {
      setMessage({ type: 'error', text: 'Username (min 3 chars) and password (min 6 chars) required' })
      return
    }

    try {
      await window.api.createAdmin({
        username: newAdmin.username,
        password: newAdmin.password,
        role: 'admin'
      })
      setMessage({ type: 'success', text: 'Admin added successfully!' })
      setNewAdmin({ username: '', password: '', confirmPassword: '' })
      setShowAddAdmin(false)
      loadAdmins()
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to add admin' })
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return
    
    try {
      await window.api.deleteAdmin(id)
      setMessage({ type: 'success', text: 'Admin deleted successfully!' })
      loadAdmins()
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete admin' })
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    try {
      const currentUser = sessionStorage.getItem('currentUser') || 'admin'
      await window.api.changePassword(currentUser, passwordForm.currentPassword, passwordForm.newPassword)
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowChangePassword(false)
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' })
    }
  }

  const handleClearAllTables = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL data (products, orders, sales, etc.) but keep admin accounts. Are you sure?')) {
      return
    }
    
    if (!confirm('This action CANNOT be undone! Type "DELETE" in your mind and click OK to proceed.')) {
      return
    }

    try {
      await window.api.clearAllTables()
      setMessage({ type: 'success', text: 'All tables cleared successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to clear tables' })
    }
  }

  const handleResetToDefaults = async () => {
    if (!confirm('⚠️ WARNING: This will reset the entire database to defaults (only admin account and categories will remain). ALL products, orders, and sales data will be lost. Are you sure?')) {
      return
    }
    
    if (!confirm('This action CANNOT be undone! Click OK to proceed with reset.')) {
      return
    }

    try {
      await window.api.resetToDefaults()
      setMessage({ type: 'success', text: 'Database reset to defaults successfully!' })
      setTimeout(() => {
        setMessage(null)
        window.location.reload() // Reload to reflect changes
      }, 2000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to reset database' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your shop, admins, and security settings</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'shop'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiSettings className="w-5 h-5" />
                Shop Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'admins'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Admin Users
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiLock className="w-5 h-5" />
                Security
              </div>
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'database'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiDatabase className="w-5 h-5" />
                Database
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Shop Details Tab */}
          {activeTab === 'shop' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                  <input
                    type="text"
                    value={shopSettings.name}
                    onChange={(e) => setShopSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Enter shop name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={shopSettings.phone}
                    onChange={(e) => setShopSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="+94 XX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={shopSettings.address}
                  onChange={(e) => setShopSettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Enter shop address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Logo</label>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Shop Logo" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <FiImage className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      <FiImage className="w-5 h-5" />
                      Choose Logo
                    </label>
                    <p className="text-sm text-gray-500 mt-2">Recommended: Square image, at least 512x512px</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveShopSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <FiSave className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Admin Users Tab */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Admin Accounts</h3>
                <button
                  onClick={() => setShowAddAdmin(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                  Add Admin
                </button>
              </div>

              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{admin.username}</h4>
                        <p className="text-sm text-gray-500">Role: {admin.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete admin"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {admins.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No admin accounts found</div>
                )}
              </div>

              {/* Add Admin Modal */}
              {showAddAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Admin</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                          type="text"
                          value={newAdmin.username}
                          onChange={(e) => setNewAdmin(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                          type="password"
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Enter password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          value={newAdmin.confirmPassword}
                          onChange={(e) => setNewAdmin(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowAddAdmin(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddAdmin}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add Admin
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Password Management</h3>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiEdit2 className="w-5 h-5" />
                  Change Password
                </button>
              </div>

              {/* Change Password Modal */}
              {showChangePassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowChangePassword(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 mt-0.5">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Danger Zone</h4>
                    <p className="text-sm text-yellow-700">These operations are irreversible. Please be careful!</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Clear All Tables</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Removes all data from products, categories, orders, sales, and shop settings. Admin accounts will be preserved.
                  </p>
                  <button
                    onClick={handleClearAllTables}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Clear All Data
                  </button>
                </div>

                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Reset to Defaults</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Completely resets the database to factory defaults. Only default admin (admin/admin123) and categories will remain. All products, orders, sales, and custom settings will be lost.
                  </p>
                  <button
                    onClick={handleResetToDefaults}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reset Database
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
