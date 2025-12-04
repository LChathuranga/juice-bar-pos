type Item = {
    id: string
    title: string
    category: string
    price: number
    image?: string
}

const getImageUrl = (imageName: string) => {
    return new URL(`../assets/images/${imageName}`, import.meta.url).href
}

import { useMemo, useState, useEffect } from 'react'
import NumberPadModal from './NumberPadModal'

export default function ItemsSection({ filter, query, onRequestAdd }: { filter: string; query?: string; onRequestAdd?: (item: Item, qty: number) => void }) {
    const effectiveQuery = query || ''
    const [selected, setSelected] = useState<Item | null>(null)
    const [pickQtyStr, setPickQtyStr] = useState<string>('1')
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    // fresh state handled inside NumberPadModal

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            setLoading(true)
            const data = await window.api.getAllProducts()
            setItems(data)
        } catch (error) {
            console.error('Failed to load products:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (selected) {
            setPickQtyStr('1')
        }
    }, [selected])

    const visible = useMemo(() => {
        const byCategory = filter === 'all' ? items : items.filter((i) => i.category === filter)
        if (!effectiveQuery || !effectiveQuery.trim()) return byCategory
        const q = effectiveQuery.trim().toLowerCase()
        return byCategory.filter((i) => i.title.toLowerCase().includes(q))
    }, [filter, effectiveQuery, items])

    if (loading) {
        return (
            <section className="px-6">
                <div className="text-center text-gray-600">Loading products...</div>
            </section>
        )
    }

    return (
        <section>
            {visible.length === 0 ? (
                <div className="px-6 py-12 text-center">
                    <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {query ? 'No products found' : 'No products available'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {query 
                            ? `No products match "${query}". Try a different search term.`
                            : items.length === 0
                                ? 'Please add products in the Admin panel to get started.'
                                : `No products in the "${filter}" category. Try selecting a different category.`
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 px-6" style={{ gridTemplateColumns: 'repeat(auto-fill, 130px)', justifyContent: 'start' }}>
                    {visible.map((it) => (
                    <div key={it.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transform transition-transform duration-150 hover:scale-[1.04] cursor-pointer bg-white w-[130px]" onClick={() => { setSelected(it); setPickQtyStr('1') }}>
                        <div className="relative h-[100px]">
                            {it.image ? (
                                <img src={getImageUrl(it.image)} alt={it.title} className="w-full h-full object-cover block" />
                            ) : (
                                <div className="w-full h-full bg-green-100" />
                            )}
                            {/* title overlay removed - title is shown in the footer */}
                            <div className="absolute top-2 right-2 bg-white bg-opacity-80 text-sm font-semibold px-2 py-1 rounded">${it.price.toFixed(2)}</div>
                        </div>
                        <div className="p-3 bg-green-600 text-white border-t">
                            <div className="font-semibold truncate" title={it.title}>{it.title}</div>
                            <div className="text-sm opacity-90 truncate">{it.category}</div>
                        </div>
                    </div>
                ))}
                </div>
            )}
            <NumberPadModal
                visible={!!selected}
                title={selected ? `Add ${selected.title}` : undefined}
                value={pickQtyStr}
                onChange={setPickQtyStr}
                onCancel={() => setSelected(null)}
                onApply={() => {
                    if (selected) {
                        const qty = Math.max(1, parseInt(pickQtyStr || '1', 10))
                        onRequestAdd?.(selected, qty)
                    }
                    setSelected(null)
                }}
            />
        </section>
    )
}
