import React from 'react'

export default function OrderSidebar() {
  const orderItems = [
    { id: 'a1', qty: 2, title: 'Green Detox', price: 15.98 },
    { id: 'b2', qty: 1, title: 'Tropical Dream', price: 6.5 },
  ]

  const subtotal = orderItems.reduce((s, i) => s + i.qty * i.price, 0)
  const discount = 1.0
  const tax = 2.1
  const total = subtotal - discount + tax

  return (
    <aside className="w-100 bg-white rounded-lg shadow p-4 mt-2">
      <div className="mb-3">
        <div className="text-sm font-semibold">Order #12345</div>
        <div className="text-xs text-gray-500">Walk-in</div>
      </div>

      <div className="space-y-3">
        {orderItems.map((it) => (
          <div key={it.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm">{it.qty}x {it.title}</div>
              <div className="text-xs text-gray-400">&nbsp;</div>
            </div>
            <div className="text-sm font-medium">${(it.qty * it.price).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div>Subtotal</div>
          <div>${subtotal.toFixed(2)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>Discount</div>
          <div>-${discount.toFixed(2)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>Tax</div>
          <div>${tax.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-green-500 text-white text-center py-4 rounded font-bold text-2xl">TOTAL: {total.toFixed(2)}</div>
      </div>
    </aside>
  )
}
