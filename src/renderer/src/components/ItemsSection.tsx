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

export default function ItemsSection({ filter }: { filter: string }) {
    const visible = filter === 'all' ? items : items.filter((i) => i.category === filter)

    return (
        <section>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, 150px)', justifyContent: 'start' }}>
                {visible.map((it) => (
                    <div key={it.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white w-[150px]">
                        <div className="relative h-[110px]">
                            {it.image ? (
                                <img src={it.image} alt={it.title} className="w-full h-full object-cover block" />
                            ) : (
                                <div className="w-full h-full bg-green-100" />
                            )}
                            {/* title overlay removed - title is shown in the footer */}
                            <div className="absolute top-2 right-2 bg-white bg-opacity-80 text-sm font-semibold px-2 py-1 rounded">{it.price}</div>
                        </div>
                        <div className="p-3 bg-green-600 text-white border-t">
                            <div className="font-semibold">{it.title}</div>
                            <div className="text-sm opacity-90">{it.category}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
