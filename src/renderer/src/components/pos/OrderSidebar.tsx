import { useMemo, useState, useEffect, useRef } from 'react'
import { FiTrash2, FiPlus, FiMinus, FiCheck } from 'react-icons/fi'
import NumberPadModal from './NumberPadModal'
import { CartItem } from '../../types'

export default function OrderSidebar({ orderItems, setOrderItems }: { orderItems: CartItem[]; setOrderItems: (v: CartItem[]) => void }) {

  const subtotal = useMemo(() => orderItems.reduce((s, i) => s + i.qty * i.price, 0), [orderItems])
  const [shopName, setShopName] = useState('Juice Bar POS')
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed')
  const [taxValue, setTaxValue] = useState<number>(0)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [isProcessingSale, setIsProcessingSale] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [currentOrderId, setCurrentOrderId] = useState<string>(new Date().getTime().toString().slice(-6))
  const [completedOrderDetails, setCompletedOrderDetails] = useState<{
    items: CartItem[]
    subtotal: number
    discount: number
    tax: number
    total: number
    paymentMethod: 'cash' | 'card'
  } | null>(null)
  const [showReceiptPreview, setShowReceiptPreview] = useState(false)
  // const [showClearDiscountConfirm, setShowClearDiscountConfirm] = useState(false)
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
    // Load shop settings
    const loadSettings = async () => {
      try {
        const settings = await window.api.getShopSettings()
        if (settings) {
          setShopName(settings.name)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

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

  const handleCompleteSale = async () => {
    if (orderItems.length === 0) {
      alert('No items in order')
      return
    }

    setIsProcessingSale(true)

    try {
      const result = await window.api.createOrder({
        subtotal,
        tax: taxValue,
        total,
        discount: discountAmount,
        payment_method: paymentMethod,
        items: orderItems.map(item => ({
          product_id: item.id,
          product_name: item.title,
          quantity: item.qty,
          price: item.price
        }))
      })

      // Generate order number from order ID
      const orderNumber = `#${String(result.id).padStart(6, '0')}`
      setCompletedOrderNumber(orderNumber)

      // Store order details for receipt
      setCompletedOrderDetails({
        items: [...orderItems],
        subtotal,
        discount: discountAmount,
        tax: taxValue,
        total,
        paymentMethod
      })

      // Clear order
      setOrderItems([])
      setDiscountValue(0)
      setDiscountType('fixed')
      setTaxValue(0)
      
      // Show success modal
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Failed to complete sale:', error)
      alert('Failed to complete sale. Please try again.')
    } finally {
      setIsProcessingSale(false)
    }
  }

  const handlePrintReceipt = async () => {
    if (!completedOrderDetails) return

    try {
      // Send print data to main process for silent printing
      await window.api.printReceipt({
        shopName: shopName,
        orderNumber: completedOrderNumber,
        date: new Date().toLocaleString(),
        paymentMethod: completedOrderDetails.paymentMethod === 'cash' ? 'Cash' : 'Card',
        items: completedOrderDetails.items.map(item => ({
          title: item.title,
          qty: item.qty,
          price: item.price,
          total: item.qty * item.price
        })),
        subtotal: completedOrderDetails.subtotal,
        discount: completedOrderDetails.discount,
        tax: completedOrderDetails.tax,
        total: completedOrderDetails.total
      })
      
      console.log('Receipt sent to printer')
    } catch (error) {
      console.error('Failed to print receipt:', error)
      alert('Failed to print receipt. Please try again.')
    }
  }

  return (
    <aside className="w-96 bg-white rounded-lg shadow p-4 h-[calc(100vh-90px)] mt-4 flex flex-col">
      <div className="mb-3">
        <div className="text-sm font-semibold">Order #{currentOrderId}</div>
        <div className="text-xs text-gray-500">Walk-in Customer</div>
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
                  <div className="text-xs text-gray-500">{it.qty} x Rs. {(it.price).toFixed(2)}</div>
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

                  <div className="text-sm font-semibold w-20 text-right">Rs. {(it.qty * it.price).toFixed(2)}</div>

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
            <div className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/90">Discount</div>
                <div className="font-semibold">{discountType === 'percent' ? `${discountValue}%` : `Rs. ${discountValue.toFixed(2)}`}</div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="flex-1 px-2 py-1 bg-white/20 rounded text-xs cursor-pointer"
                  onClick={() => { setDiscountValue(0); setDiscountType('fixed'); setModalDiscountStr('0') }}
                  aria-label="Clear discount"
                >
                  Clear
                </button>
                <button
                  className="flex-1 px-2 py-1 bg-white/20 rounded text-xs cursor-pointer"
                  onClick={() => { setModalDiscountValue(discountValue); setModalDiscountType('percent'); setShowDiscountModal(true) }}
                  aria-label="Edit discount"
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="w-full px-3 py-2 bg-indigo-500 text-white rounded text-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/90">Tax</div>
                <div className="font-semibold">Rs. {taxValue.toFixed(2)}</div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="flex-1 px-2 py-1 bg-white/20 rounded text-xs cursor-pointer"
                  onClick={() => { setTaxValue(0); setModalTaxStr('0') }}
                  aria-label="Clear tax"
                >
                  Clear
                </button>
                <button
                  className="flex-1 px-2 py-1 bg-white/20 rounded text-xs cursor-pointer"
                  onClick={() => { setModalTaxValue(taxValue); setShowTaxModal(true) }}
                  aria-label="Edit tax"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-2">
            <div className="flex items-center justify-between text-sm">
              <div>Subtotal</div>
              <div>Rs. {subtotal.toFixed(2)}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>Discount</div>
              <div>- Rs. {discountAmount.toFixed(2)}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>Tax</div>
              <div>Rs. {taxValue.toFixed(2)}</div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mt-3 border-t pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                  paymentMethod === 'cash'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm">Cash</span>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-sm">Card</span>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="bg-green-600 text-white text-center py-3 rounded font-bold text-xl">TOTAL: Rs. {total.toFixed(2)}</div>
            <button 
              className="w-full mt-3 py-3 bg-emerald-500 text-white font-bold rounded hover:bg-emerald-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={handleCompleteSale}
              disabled={isProcessingSale || orderItems.length === 0}
            >
              {isProcessingSale ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'COMPLETE SALE'
              )}
            </button>
          </div>
        </div>
      </div>
      <NumberPadModal
        visible={showDiscountModal}
        title="Set Discount"
        value={modalDiscountStr}
        suffix={modalDiscountType === 'percent' ? '%' : ''}
        onChange={setModalDiscountStr}
        allowDecimal={false}
        onCancel={() => setShowDiscountModal(false)}
        onApply={() => {
          let v = modalDiscountType === 'percent' ? parseInt(modalDiscountStr || '0', 10) : parseFloat(modalDiscountStr || '0')
          if (modalDiscountType === 'percent') {
            if (Number.isNaN(v)) v = 0
            v = Math.max(0, Math.min(100, v))
          } else {
            if (Number.isNaN(v)) v = 0
            v = Math.max(0, v)
            // optionally cap fixed discount to subtotal
            if (v > subtotal) v = subtotal
          }
          setDiscountValue(v)
          setDiscountType(modalDiscountType)
          setShowDiscountModal(false)
        }}
      />
      <NumberPadModal
        visible={showTaxModal}
        title="Set Tax"
        value={modalTaxStr}
        onChange={setModalTaxStr}
        allowDecimal={true}
        onCancel={() => setShowTaxModal(false)}
        onApply={() => {
          let v = parseFloat(modalTaxStr || '0')
          if (Number.isNaN(v)) v = 0
          v = Math.max(0, v)
          setTaxValue(v)
          setShowTaxModal(false)
        }}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-8 text-center relative">
            <button
              onClick={() => {
                setShowSuccessModal(false)
                setPaymentMethod('cash')
                setCurrentOrderId(new Date().getTime().toString().slice(-6))
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sale Completed!</h2>
              <p className="text-gray-600 mb-4">Order {completedOrderNumber} has been successfully processed</p>
              {completedOrderDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {completedOrderDetails.paymentMethod === 'cash' ? '💵 Cash' : '💳 Card'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-800">Rs. {completedOrderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  {completedOrderDetails.discount > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-red-600">- Rs. {completedOrderDetails.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {completedOrderDetails.tax > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-800">Rs. {completedOrderDetails.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-300 mt-2">
                    <span className="text-gray-600 font-semibold">Total Amount:</span>
                    <span className="font-bold text-lg text-green-600">Rs. {completedOrderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReceiptPreview(true)}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showReceiptPreview && completedOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Receipt Preview</h3>
              <button
                onClick={() => setShowReceiptPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div className="bg-white p-6 shadow-sm" style={{ fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
                <div className="text-center mb-4 pb-3 border-b-2 border-dashed border-gray-800">
                  <h1 className="text-xl font-bold mb-1">{shopName.toUpperCase()}</h1>
                  <p className="text-xs">Sri Lanka</p>
                </div>
                <div className="mb-4 text-xs space-y-1">
                  <div>Order: {completedOrderNumber}</div>
                  <div>Date: {new Date().toLocaleString()}</div>
                  <div>Payment: {completedOrderDetails.paymentMethod === 'cash' ? 'Cash' : 'Card'}</div>
                </div>
                <div className="mb-4 pb-3 border-b border-dashed border-gray-800">
                  {completedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="mb-2 text-xs">
                      <div className="flex justify-between">
                        <div className="flex-1">{item.title}</div>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <div>{item.qty} x {item.price.toFixed(2)}</div>
                        <div>Rs. {(item.qty * item.price).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs. {completedOrderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  {completedOrderDetails.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>- Rs. {completedOrderDetails.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {completedOrderDetails.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>Rs. {completedOrderDetails.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm pt-2 mt-2 border-t-2 border-gray-800">
                    <span>TOTAL:</span>
                    <span>Rs. {completedOrderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-gray-800 text-xs space-y-1">
                  <p>Thank you for your purchase!</p>
                  <p>Please come again</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Now
              </button>
              <button
                onClick={() => setShowReceiptPreview(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  )
}
