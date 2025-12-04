import React, { useEffect, useRef } from 'react'

type ChangeHandler = React.Dispatch<React.SetStateAction<string>>

type Props = {
  title?: string
  visible: boolean
  value: string
  suffix?: string
  onChange: ChangeHandler
  onCancel: () => void
  onApply: () => void
  allowDecimal?: boolean
}

export default function NumberPadModal({ title, visible, value, suffix, onChange, onCancel, onApply, allowDecimal }: Props) {
  const valueRef = useRef(value)
  const freshRef = useRef<boolean>(true)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    if (!visible) return
    // mark as fresh so first digit replaces current value
    freshRef.current = true
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onApply()
      } else if (/^[0-9]$/.test(e.key)) {
        const d = e.key
        onChange((v) => (freshRef.current ? d : (v === '0' ? d : v + d)))
        freshRef.current = false
      } else if (e.key === 'Backspace') {
        onChange((v) => (v.length > 1 ? v.slice(0, -1) : '0'))
        freshRef.current = false
      } else if (allowDecimal && e.key === '.') {
        onChange((v) => (freshRef.current ? '0.' : (v.includes('.') ? v : v + '.')))
        freshRef.current = false
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, onApply, onChange, allowDecimal])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel} />
      <div className="relative bg-white rounded p-4 w-80 z-50">
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        <div className="text-center text-2xl font-mono">{value}{suffix || ''}</div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="p-3 bg-gray-100 rounded text-lg" onClick={() => { onChange((s) => (freshRef.current ? String(n) : (s === '0' ? String(n) : s + String(n)))); freshRef.current = false }}>{n}</button>
          ))}
          <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { onChange((s) => (s.length > 1 ? s.slice(0, -1) : '0')); freshRef.current = false }}>⌫</button>
          <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { onChange((s) => (freshRef.current ? '0' : (s === '0' ? '0' : s + '0'))); freshRef.current = false }}>0</button>
          <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { onChange((s) => (s.includes('.') ? s : s + '.')); freshRef.current = false }} aria-hidden={!allowDecimal}>.</button>
        </div>

        <div className="mt-3">
          <button className="w-full p-3 bg-gray-100 rounded text-lg" onClick={() => { onChange('0'); freshRef.current = true }}>Clear</button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-2 rounded border" onClick={onCancel}>Cancel</button>
          <button className="px-3 py-2 bg-emerald-500 text-white rounded" onClick={onApply}>Apply</button>
        </div>
      </div>
    </div>
  )
}
