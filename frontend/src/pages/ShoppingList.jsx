import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { shoppingCategories as initialCategories } from '../data/mockData'

export default function ShoppingList() {
  const [categories, setCategories] = useState(initialCategories)

  const toggle = (catKey, id) => {
    setCategories((prev) => ({
      ...prev,
      [catKey]: prev[catKey].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }))
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <SectionHeader
          title="Shopping list"
          subtitle="Check off as you shop"
        />
        <div className="space-y-8">
          {Object.entries(categories).map(([catName, items]) => (
            <section key={catName}>
              <h3 className="mb-3 text-lg font-semibold text-ink">{catName}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-white px-3 shadow-soft transition-shadow hover:shadow-soft-lg focus-within:ring-2 focus-within:ring-sage focus-within:ring-offset-2 sm:gap-4 sm:px-4">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggle(catName, item.id)}
                        className="h-5 w-5 rounded border-cream-300 text-sage focus:ring-sage"
                      />
                      <span
                        className={`flex-1 font-medium ${
                          item.checked ? 'text-ink-muted line-through' : 'text-ink'
                        }`}
                      >
                        {item.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
