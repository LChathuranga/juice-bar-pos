import { useEffect, useState } from 'react'
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiPackage } from 'react-icons/fi'
import { Sale, TopProduct } from '../../types'

export default function SalesReport() {
  const [salesData, setSalesData] = useState<Sale[]>([])
  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [totalOrders, setTotalOrders] = useState<number>(0)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSalesData()
  }, [])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      const [sales, revenue, orders, top] = await Promise.all([
        window.api.getSalesReport(7),
        window.api.getTotalRevenue(7),
        window.api.getTotalOrders(7),
        window.api.getTopProducts(5, 30)
      ])
      
      setSalesData(sales)
      setTotalRevenue(revenue)
      setTotalOrders(orders)
      setTopProducts(top)
    } catch (error) {
      console.error('Failed to load sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const activeProducts = new Set(salesData.map(s => s.product)).size

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-600">Loading sales data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
            <FiDollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">Rs. {totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">Last 7 days</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
            <FiShoppingCart className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{totalOrders}</p>
          <p className="text-sm opacity-80 mt-1">Items sold</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Avg. Order Value</h3>
            <FiTrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">Rs. {avgOrderValue.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">Per transaction</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Products</h3>
            <FiPackage className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{activeProducts}</p>
          <p className="text-sm opacity-80 mt-1">Active items</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Recent Sales</h2>
          <p className="text-gray-600 mt-1">Transaction history</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Product</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-semibold">Quantity</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No sales data available
                    </td>
                  </tr>
                ) : (
                  salesData.map((sale, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">{sale.date}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{sale.product}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{sale.quantity}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        Rs. {sale.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Top Selling Products</h2>
          <p className="text-gray-600 mt-1">Best performers</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No product data available
              </div>
            ) : (
              topProducts.map((item, index) => (
                <div key={item.product} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.product}</p>
                    <p className="text-sm text-gray-600">{item.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Rs. {item.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
