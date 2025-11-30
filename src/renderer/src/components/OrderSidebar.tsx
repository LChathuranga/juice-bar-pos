import React, { useMemo, useState, useEffect, useRef } from 'react'
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi'

type OrderItem = { id: string; qty: number; title: string; price: number }

export default function OrderSidebar({ orderItems, setOrderItems }: { orderItems: OrderItem[]; setOrderItems: (v: OrderItem[]) => void }) {

  const subtotal = useMemo(() => orderItems.reduce((s, i) => s + i.qty * i.price, 0), [orderItems])
  const [discountValue, setDiscountValue] = useState<number>(1.0)
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed')
  const [taxValue, setTaxValue] = useState<number>(2.1)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [modalDiscountValue, setModalDiscountValue] = useState<number>(discountValue)
  const [modalDiscountType, setModalDiscountType] = useState<'fixed' | 'percent'>(discountType)
  const [showTaxModal, setShowTaxModal] = useState(false)
  const [modalTaxValue, setModalTaxValue] = useState<number>(taxValue)
  const [modalDiscountStr, setModalDiscountStr] = useState<string>(String(modalDiscountValue))
  const [modalDiscountFresh, setModalDiscountFresh] = useState<boolean>(false)
  const [modalTaxStr, setModalTaxStr] = useState<string>(String(modalTaxValue))
  const [modalTaxFresh, setModalTaxFresh] = useState<boolean>(false)

  const modalDiscountStrRef = useRef<string>(modalDiscountStr)
  const modalDiscountFreshRef = useRef<boolean>(modalDiscountFresh)
  const modalDiscountTypeRef = useRef<'fixed' | 'percent'>(modalDiscountType)
  const modalTaxStrRef = useRef<string>(modalTaxStr)
  const modalTaxFreshRef = useRef<boolean>(modalTaxFresh)

  useEffect(() => {
    modalDiscountStrRef.current = modalDiscountStr
  }, [modalDiscountStr])
  useEffect(() => {
    modalDiscountFreshRef.current = modalDiscountFresh
  }, [modalDiscountFresh])
  useEffect(() => {
    modalDiscountTypeRef.current = modalDiscountType
  }, [modalDiscountType])

  useEffect(() => {
    if (!showDiscountModal) return
    setModalDiscountStr(String(modalDiscountValue))
    setModalDiscountFresh(true)
    modalDiscountStrRef.current = String(modalDiscountValue)
    modalDiscountFreshRef.current = true

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const curr = modalDiscountStrRef.current
        const currType = modalDiscountTypeRef.current
        const v = currType === 'percent' ? parseInt(curr || '0', 10) : parseFloat(curr || '0')
        setDiscountValue(Number.isNaN(v) ? 0 : v)
        setDiscountType(currType)
        setShowDiscountModal(false)
      } else if (/^[0-9]$/.test(e.key)) {
        const d = e.key
        setModalDiscountStr((s) => (modalDiscountFreshRef.current ? d : (s === '0' ? d : s + d)))
        modalDiscountFreshRef.current = false
        setModalDiscountFresh(false)
      } else if (e.key === 'Backspace') {
        setModalDiscountStr((s) => (s.length > 1 ? s.slice(0, -1) : '0'))
        modalDiscountFreshRef.current = false
        setModalDiscountFresh(false)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showDiscountModal, modalDiscountValue])

  useEffect(() => {
    modalTaxStrRef.current = modalTaxStr
  }, [modalTaxStr])
  useEffect(() => {
    modalTaxFreshRef.current = modalTaxFresh
  }, [modalTaxFresh])

  useEffect(() => {
    if (!showTaxModal) return
    setModalTaxStr(String(modalTaxValue))
    setModalTaxFresh(true)
    modalTaxStrRef.current = String(modalTaxValue)
    modalTaxFreshRef.current = true

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const curr = modalTaxStrRef.current
        const v = parseFloat(curr || '0')
        setTaxValue(Number.isNaN(v) ? 0 : v)
        setShowTaxModal(false)
      } else if (/^[0-9]$/.test(e.key)) {
        const d = e.key
        setModalTaxStr((s) => (modalTaxFreshRef.current ? d : (s === '0' ? d : s + d)))
        modalTaxFreshRef.current = false
        setModalTaxFresh(false)
      } else if (e.key === 'Backspace') {
        setModalTaxStr((s) => (s.length > 1 ? s.slice(0, -1) : '0'))
        modalTaxFreshRef.current = false
        setModalTaxFresh(false)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showTaxModal, modalTaxValue])

  function changeQty(id: string, delta: number) {
    setOrderItems(orderItems.map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it)))
  }

  function deleteItem(id: string) {
    setOrderItems(orderItems.filter((it) => it.id !== id))
  }

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') return (subtotal * discountValue) / 100
    return discountValue
  }, [subtotal, discountValue, discountType])

  const total = useMemo(() => Math.max(0, subtotal - discountAmount + taxValue), [subtotal, discountAmount, taxValue])

  return (
    <aside className="w-96 bg-white rounded-lg shadow p-4 h-[calc(100vh-90px)] mt-4 flex flex-col">
      <div className="mb-3">
        <div className="text-sm font-semibold">Order #12345</div>
        <div className="text-xs text-gray-500">Walk-in</div>
      </div>

      <div className="flex-1 overflow-auto pr-2">
        {orderItems.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            There is no any order yet.
          </div>
        ) : (
          <div className="space-y-3">
            {orderItems.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{it.title}</div>
                  <div className="text-xs text-gray-500">{it.qty} x {(it.price).toFixed(2)}</div>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  <div className="flex items-center border rounded overflow-hidden">
                    <button
                      className={`px-2 text-sm ${it.qty === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                      onClick={() => changeQty(it.id, -1)}
                      aria-label={`Decrease ${it.title}`}
                      disabled={it.qty === 0}
                    >
                      <FiMinus />
                    </button>
                    <div className="px-3 text-sm">{it.qty}</div>
                    <button
                      className="px-2 text-sm text-gray-600 hover:bg-gray-100"
                      onClick={() => changeQty(it.id, 1)}
                      aria-label={`Increase ${it.title}`}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="text-sm font-semibold w-20 text-right">${(it.qty * it.price).toFixed(2)}</div>

                  <button
                    className="text-red-500 hover:text-red-700 text-sm p-1 rounded"
                    onClick={() => deleteItem(it.id)}
                    aria-label={`Delete ${it.title}`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* order items list ends here; summary and actions are in the footer below */}
      </div>

      <div className="mt-4 mt-auto border-t pt-3">
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm flex items-center justify-between">
              <div>
                <div className="text-xs text-white/90">Discount</div>
                <div className="font-semibold">{discountType === 'percent' ? `${discountValue}%` : `$${discountValue.toFixed(2)}`}</div>
              </div>
              <button className="ml-3 px-2 py-1 bg-white/20 rounded text-xs" onClick={() => { setModalDiscountValue(discountValue); setModalDiscountType('percent'); setShowDiscountModal(true) }}>Edit</button>
            </div>

            <div className="w-full px-3 py-2 bg-indigo-500 text-white rounded text-sm flex items-center justify-between">
              <div>
                <div className="text-xs text-white/90">Tax</div>
                <div className="font-semibold">${taxValue.toFixed(2)}</div>
              </div>
              <button className="ml-3 px-2 py-1 bg-white/20 rounded text-xs" onClick={() => { setModalTaxValue(taxValue); setShowTaxModal(true) }}>Edit</button>
            </div>
          </div>

          <div className="border-t pt-2">
            <div className="flex items-center justify-between text-sm">
              <div>Subtotal</div>
              <div>${subtotal.toFixed(2)}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>Discount</div>
              <div>- ${discountAmount.toFixed(2)}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>Tax</div>
              <div>${taxValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="bg-green-600 text-white text-center py-3 rounded font-bold text-xl">TOTAL: ${total.toFixed(2)}</div>
            <button className="w-full mt-3 py-3 bg-emerald-500 text-white font-bold rounded">COMPLETE SALE</button>
          </div>
        </div>
      </div>
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowDiscountModal(false)} />
          <div className="relative bg-white rounded p-4 w-96 z-50">
            <h3 className="text-lg font-semibold mb-2">Set Discount</h3>
            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="col-span-1 text-gray-600">Type</label>
              <select className="col-span-2 p-1 rounded border" value={modalDiscountType} onChange={(e) => setModalDiscountType(e.target.value as any)}>
                <option value="fixed">Fixed</option>
                <option value="percent">%</option>
              </select>
            </div>

            <div className="mt-3">
              <div className="text-center text-2xl font-mono">{modalDiscountStr}{modalDiscountType === 'percent' ? '%' : ''}</div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n} className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setModalDiscountStr((s) => (modalDiscountFresh ? String(n) : (s === '0' ? String(n) : s + String(n)))); setModalDiscountFresh(false) }}>{n}</button>
                ))}
                <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setModalDiscountStr((s) => (s.length > 1 ? s.slice(0, -1) : '0')); setModalDiscountFresh(false) }}>⌫</button>
                <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setModalDiscountStr((s) => (modalDiscountFresh ? '0' : (s === '0' ? '0' : s + '0'))); setModalDiscountFresh(false) }}>0</button>
                <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setModalDiscountStr('1'); setModalDiscountFresh(true) }}>Clear</button>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 rounded border" onClick={() => setShowDiscountModal(false)}>Cancel</button>
              <button className="px-3 py-2 bg-emerald-500 text-white rounded" onClick={() => {
                const v = modalDiscountType === 'percent' ? parseInt(modalDiscountStr || '0', 10) : parseFloat(modalDiscountStr || '0')
                setDiscountValue(Number.isNaN(v) ? 0 : v)
                setDiscountType(modalDiscountType)
                setShowDiscountModal(false)
              }}>Apply</button>
            </div>
          </div>
        </div>
      )}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowTaxModal(false)} />
          <div className="relative bg-white rounded p-4 w-96 z-50">
            <h3 className="text-lg font-semibold mb-2">Set Tax</h3>

            <div className="mt-3">
              <div className="text-center text-2xl font-mono">{modalTaxStr}</div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n} className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setModalTaxStr((s) => (modalTaxFresh ? String(n) : (s === '0' ? String(n) : s + String(n)))); setModalTaxFresh(false) }}>{n}</button>
                ))}
                <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setModalTaxStr((s) => (s.length > 1 ? s.slice(0, -1) : '0')); setModalTaxFresh(false) }}>⌫</button>
                <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setModalTaxStr((s) => (modalTaxFresh ? '0' : (s === '0' ? '0' : s + '0'))); setModalTaxFresh(false) }}>0</button>
                <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setModalTaxStr('0'); setModalTaxFresh(true) }}>Clear</button>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 rounded border" onClick={() => setShowTaxModal(false)}>Cancel</button>
              <button className="px-3 py-2 bg-emerald-500 text-white rounded" onClick={() => { const v = parseFloat(modalTaxStr || '0'); setTaxValue(Number.isNaN(v) ? 0 : v); setShowTaxModal(false) }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
