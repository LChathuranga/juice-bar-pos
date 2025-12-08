import { useEffect, useState } from 'react'
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiPackage, FiCalendar } from 'react-icons/fi'
import { Sale, TopProduct, Order } from '../../types'

type DateFilter = 'today' | '7days' | '30days' | 'all'

export default function SalesReport() {
  const [salesData, setSalesData] = useState<Sale[]>([])
  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [totalOrders, setTotalOrders] = useState<number>(0)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [displayedOrders, setDisplayedOrders] = useState<number>(8)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')

  useEffect(() => {
    loadSalesData()
  }, [dateFilter])

  const getDaysFromFilter = (filter: DateFilter): number => {
    switch (filter) {
      case 'today': return 0
      case '7days': return 7
      case '30days': return 30
      case 'all': return -1
    }
  }

  const getFilterLabel = (filter: DateFilter): string => {
    switch (filter) {
      case 'today': return 'Today'
      case '7days': return 'Last 7 days'
      case '30days': return 'Last 30 days'
      case 'all': return 'All time'
    }
  }

  const loadSalesData = async () => {
    try {
      setLoading(true)
      const days = getDaysFromFilter(dateFilter)
      const [sales, revenue, orders, top, recent] = await Promise.all([
        window.api.getSalesReport(days),
        window.api.getTotalRevenue(days),
        window.api.getTotalOrders(days),
        window.api.getTopProducts(5, days),
        window.api.getOrders(50, days)
      ])
      
      setSalesData(sales)
      setTotalRevenue(revenue)
      setTotalOrders(orders)
      setTopProducts(top)
      setRecentOrders(recent)
      setDisplayedOrders(8) // Reset pagination when filter changes
    } catch (error) {
      console.error('Failed to load sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    setDisplayedOrders(prev => prev + 8)
  }

  const visibleOrders = recentOrders.slice(0, displayedOrders)
  const hasMoreOrders = displayedOrders < recentOrders.length

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
      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <FiCalendar className="w-5 h-5" />
            <span className="font-medium">Filter by:</span>
          </div>
          <div className="flex gap-2">
            {(['today', '7days', '30days', 'all'] as DateFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateFilter === filter
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getFilterLabel(filter)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
            <FiDollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">Rs. {totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">{getFilterLabel(dateFilter)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
            <FiShoppingCart className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{totalOrders}</p>
          <p className="text-sm opacity-80 mt-1">{getFilterLabel(dateFilter)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Avg. Order Value</h3>
            <FiTrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">Rs. {avgOrderValue.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">{getFilterLabel(dateFilter)}</p>
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
          <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
          <p className="text-gray-600 mt-1">Latest transactions with payment details</p>
        </div>
        <div className="p-6">
          <div className="overflow-auto max-h-80">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Order ID</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Payment</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Subtotal</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Discount</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Tax</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No orders available
                    </td>
                  </tr>
                ) : (
                  visibleOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">#{order.id.toString().padStart(6, '0')}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.payment_method === 'cash' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.payment_method === 'cash' ? '💵 Cash' : '💳 Card'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">Rs. {order.subtotal.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-red-600">
                        {order.discount > 0 ? `- Rs. ${order.discount.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">Rs. {order.tax.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        Rs. {order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {hasMoreOrders && (
            <div className="mt-4 text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Load More Orders
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Sales Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Product Sales</h2>
          <p className="text-gray-600 mt-1">Sales by product</p>
        </div>
        <div className="p-6">
          <div className="overflow-auto max-h-80">
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
          <div className="space-y-4 overflow-auto max-h-80">
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
