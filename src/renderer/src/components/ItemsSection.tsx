import greenDetox from '../assets/images/green.jpg'
import berryBlast from '../assets/images/berry.jpg'
type Item = {
    id: string
    title: string
    category: string
    price: string
    image?: string
}

const items: Item[] = [
    { id: '1', title: 'Green Detox', category: 'cold-press', price: '$5.50', image: greenDetox },
    { id: '2', title: 'Berry Blast', category: 'smoothies', price: '$6.00', image: berryBlast },
    { id: '3', title: 'Ginger Shot', category: 'shots', price: '$3.00', image: greenDetox },
    { id: '4', title: 'Protein Add-On', category: 'add-ons', price: '$1.50', image: berryBlast },
    { id: '5', title: 'Citrus Mix', category: 'cold-press', price: '$5.00', image: greenDetox },
    { id: '6', title: 'Green Detox', category: 'cold-press', price: '$5.50', image: greenDetox },
    { id: '7', title: 'Berry Blast', category: 'smoothies', price: '$6.00', image: berryBlast },
    { id: '8', title: 'Ginger Shot', category: 'shots', price: '$3.00', image: greenDetox },
    // { id: '4', title: 'Protein Add-On', category: 'add-ons', price: '$1.50', image: berryBlast },
    // { id: '5', title: 'Citrus Mix', category: 'cold-press', price: '$5.00', image: greenDetox },
    // { id: '1', title: 'Green Detox', category: 'cold-press', price: '$5.50', image: greenDetox },
    // { id: '2', title: 'Berry Blast', category: 'smoothies', price: '$6.00', image: berryBlast },
    // { id: '3', title: 'Ginger Shot', category: 'shots', price: '$3.00', image: greenDetox },
    // { id: '4', title: 'Protein Add-On', category: 'add-ons', price: '$1.50', image: berryBlast },
    // { id: '5', title: 'Citrus Mix', category: 'cold-press', price: '$5.00', image: greenDetox },
    // { id: '1', title: 'Green Detox', category: 'cold-press', price: '$5.50', image: greenDetox },
    // { id: '2', title: 'Berry Blast', category: 'smoothies', price: '$6.00', image: berryBlast },
    // { id: '3', title: 'Ginger Shot', category: 'shots', price: '$3.00', image: greenDetox },
    // { id: '4', title: 'Protein Add-On', category: 'add-ons', price: '$1.50', image: berryBlast },
    // { id: '5', title: 'Citrus Mix', category: 'cold-press', price: '$5.00', image: greenDetox },
    // { id: '1', title: 'Green Detox', category: 'cold-press', price: '$5.50', image: greenDetox },
    // { id: '2', title: 'Berry Blast', category: 'smoothies', price: '$6.00', image: berryBlast },
    // { id: '3', title: 'Ginger Shot', category: 'shots', price: '$3.00', image: greenDetox },
    // { id: '4', title: 'Protein Add-On', category: 'add-ons', price: '$1.50', image: berryBlast },
    // { id: '5', title: 'Citrus Mix', category: 'cold-press', price: '$5.00', image: greenDetox },
]

import { useMemo, useState, useRef, useEffect } from 'react'

export default function ItemsSection({ filter, query, setQuery, onRequestAdd }: { filter: string; query?: string; setQuery?: (v: string) => void; onRequestAdd?: (item: Item, qty: number) => void }) {
    const [localQuery, setLocalQuery] = useState('')
    const effectiveQuery = typeof query === 'string' ? query : localQuery
    const [selected, setSelected] = useState<Item | null>(null)
    const [pickQtyStr, setPickQtyStr] = useState<string>('1')
    const [fresh, setFresh] = useState<boolean>(false)
    const modalRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (selected) {
            setPickQtyStr('1')
            setFresh(true)
            // focus modal to capture keyboard input
            setTimeout(() => modalRef.current?.focus(), 0)
        }
    }, [selected])

    const visible = useMemo(() => {
        const byCategory = filter === 'all' ? items : items.filter((i) => i.category === filter)
        if (!effectiveQuery || !effectiveQuery.trim()) return byCategory
        const q = effectiveQuery.trim().toLowerCase()
        return byCategory.filter((i) => i.title.toLowerCase().includes(q))
    }, [filter, effectiveQuery])

    return (
        <section>
            <div className="grid gap-4 px-6" style={{ gridTemplateColumns: 'repeat(auto-fill, 130px)', justifyContent: 'start' }}>
                {visible.map((it) => (
                    <div key={it.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transform transition-transform duration-150 hover:scale-[1.04] cursor-pointer bg-white w-[130px]" onClick={() => { setSelected(it); setPickQtyStr('1') }}>
                        <div className="relative h-[100px]">
                            {it.image ? (
                                <img src={it.image} alt={it.title} className="w-full h-full object-cover block" />
                            ) : (
                                <div className="w-full h-full bg-green-100" />
                            )}
                            {/* title overlay removed - title is shown in the footer */}
                            <div className="absolute top-2 right-2 bg-white bg-opacity-80 text-sm font-semibold px-2 py-1 rounded">{it.price}</div>
                        </div>
                        <div className="p-3 bg-green-600 text-white border-t">
                            <div className="font-semibold truncate" title={it.title}>{it.title}</div>
                            <div className="text-sm opacity-90 truncate">{it.category}</div>
                        </div>
                    </div>
                ))}
                    {selected && (
                        <div className="fixed inset-0 z-40 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setSelected(null)} />
                            <div
                                className="relative bg-white rounded-lg shadow-lg w-80 p-4 z-50"
                                tabIndex={0}
                                ref={modalRef}
                                onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const qty = Math.max(1, parseInt(pickQtyStr || '1', 10))
                                    onRequestAdd?.(selected, qty)
                                    setSelected(null)
                                } else if (/^[0-9]$/.test(e.key)) {
                                    const digit = e.key
                                    setPickQtyStr((s) => (fresh ? digit : (s === '0' ? digit : s + digit)))
                                    setFresh(false)
                                } else if (e.key === 'Backspace') {
                                    setPickQtyStr((s) => (s.length > 1 ? s.slice(0, -1) : '0'))
                                    setFresh(false)
                                }
                            }}
                            >
                                    <div className="flex items-center gap-3">
                                        {selected.image ? <img src={selected.image} alt={selected.title} className="w-16 h-16 object-cover rounded" /> : <div className="w-16 h-16 bg-gray-100 rounded" />}
                                        <div>
                                            <div className="font-semibold">{selected.title}</div>
                                            <div className="text-sm text-gray-500">{selected.category} • {selected.price}</div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="text-center text-2xl font-mono">{pickQtyStr}</div>
                                        <div className="grid grid-cols-3 gap-2 mt-3">
                                            {[1,2,3,4,5,6,7,8,9].map((n) => (
                                                <button key={n} className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setPickQtyStr((s) => (fresh ? String(n) : (s === '0' ? String(n) : s + String(n)))); setFresh(false) }}>{n}</button>
                                            ))}
                                            <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setPickQtyStr((s) => (s.length > 1 ? s.slice(0, -1) : '0')); setFresh(false) }}>⌫</button>
                                            <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setPickQtyStr((s) => (fresh ? '0' : (s === '0' ? '0' : s + '0'))); setFresh(false) }}>0</button>
                                            <button className="p-3 bg-gray-100 rounded text-lg" onClick={() => { setPickQtyStr('1'); setFresh(true) }}>Clear</button>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2">
                                        <button className="px-3 py-2 rounded border" onClick={() => setSelected(null)}>Cancel</button>
                                        <button className="px-4 py-2 bg-emerald-500 text-white rounded" onClick={() => { const qty = Math.max(1, parseInt(pickQtyStr || '1', 10)); onRequestAdd?.(selected, qty); setSelected(null) }}>Enter</button>
                                    </div>
                                </div>
                        </div>
                    )}
            </div>
        </section>
    )
}
