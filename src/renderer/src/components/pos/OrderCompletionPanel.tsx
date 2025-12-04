import React from 'react'

type OrderItem = { id: string; qty: number; title: string; note?: string; price: number }

export default function OrderCompletionPanel() {
  const orderItems: OrderItem[] = [
    { id: 'o1', qty: 2, title: 'Green Detox', note: 'Drepuul Dream', price: 11.0 },
    { id: 'o2', qty: 1, title: 'Green Detox', note: undefined, price: 6.0 },
  ]

  const subtotal = orderItems.reduce((s, i) => s + i.qty * i.price, 0)
  const discount = 0
  const tax = 0
  const total = subtotal - discount + tax

  return (
    <aside className="w-80 bg-white rounded-lg shadow p-4">
      <div className="text-xs text-gray-500 mb-3">Barista: Alex<br />2014.11-12 17:5:48</div>

      <div className="space-y-3">
        {orderItems.map((it) => (
          <div key={it.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 text-sm font-semibold">{it.qty}x</div>
            <div className="flex-1">
              <div className="text-sm font-medium">{it.title} <span className="text-gray-500">{it.note}</span></div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <button className="w-7 h-7 rounded-full bg-rose-300 text-white">-</button>
                <div className="w-7 h-7 rounded-full border flex items-center justify-center">{it.qty}</div>
                <button className="w-7 h-7 rounded-full bg-emerald-300 text-white">+</button>
                <div className="ml-auto font-semibold">${(it.price * it.qty).toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-3">
        <div className="flex items-center justify-between text-sm">
          <div>TOTAL:</div>
          <div className="font-bold">${total.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-4 bg-emerald-500 text-white text-center py-3 rounded font-bold text-lg">TOTAL: ${total.toFixed(2)}</div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="py-3 bg-emerald-300 rounded text-white font-semibold">CASH</button>
        <button className="py-3 bg-sky-500 rounded text-white font-semibold">CREDIT/DEBIT CARD</button>
        <button className="py-3 bg-gray-200 rounded text-gray-700 font-semibold">GIFT CARD</button>
        <button className="py-3 bg-yellow-400 rounded text-white font-semibold">MOBILE PAY</button>
      </div>

      <div className="mt-4 bg-gray-50 p-3 rounded">
        <div className="text-xs text-gray-500">Amount Received:</div>
        <input className="w-full p-2 mt-1 rounded border" defaultValue={`$${(total - 0).toFixed(2)}`} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">Split Payment</div>
        <div className="bg-emerald-200 text-black px-2 py-1 rounded">0.44</div>
      </div>

      <div className="mt-4">
        <button className="w-full py-3 bg-emerald-500 text-white font-bold rounded">COMPLETE SALE</button>
      </div>
    </aside>
  )
}
