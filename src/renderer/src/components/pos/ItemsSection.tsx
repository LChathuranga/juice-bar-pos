import { useMemo, useState, useEffect } from 'react'
import NumberPadModal from './NumberPadModal'
import { Product } from '../../types'

const getImageUrl = (imageName: string) => {
    return new URL(`../../assets/images/${imageName}`, import.meta.url).href
}

export default function ItemsSection({ filter, query, onRequestAdd }: { filter: string; query?: string; onRequestAdd?: (item: Product, qty: number) => void }) {
    const effectiveQuery = query || ''
    const [selected, setSelected] = useState<Product | null>(null)
    const [pickQtyStr, setPickQtyStr] = useState<string>('1')
    const [items, setItems] = useState<Product[]>([])
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
                                <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.5,8.5c-1.333,0-2.5-0.5-3.5-1.5c-1,1-2.167,1.5-3.5,1.5S11,8,10,7C9,8,7.833,8.5,6.5,8.5S4,8,3,7v11c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V7C20,8,19.167,8.5,20.5,8.5z M7,17H5v-2h2V17z M7,13H5v-2h2V13z M11,17H9v-2h2V17z M11,13H9v-2h2V13z M15,17h-2v-2h2V17z M15,13h-2v-2h2V13z M19,17h-2v-2h2V17z M19,13h-2v-2h2V13z" opacity=".3"/>
                                        <path d="M3,2v4c1,1,2,1.5,3.5,1.5S9,7,10,6c1,1,2.5,1.5,4,1.5s3-0.5,4-1.5c1,1,2,1.5,3.5,1.5S23,7,24,6V2H3z M19,20H5V9c-1.667,0-3,0.667-4,2v11c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V11c-1,1.333-2.333,2-4,2V20z"/>
                                    </svg>
                                </div>
                            )}
                            {/* title overlay removed - title is shown in the footer */}
                            <div className="absolute top-2 right-2 bg-white bg-opacity-80 text-sm font-semibold px-2 py-1 rounded">Rs. {it.price.toFixed(2)}</div>
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
