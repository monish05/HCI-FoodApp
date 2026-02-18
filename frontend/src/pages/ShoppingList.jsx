import PageContainer from '../components/PageContainer'
import SectionHeader from '../components/SectionHeader'
import { useShopping } from '../context/ShoppingContext'

export default function ShoppingList() {
  const { categories, toggle } = useShopping()

  return (
    <PageContainer>
      <div className="page-content">
        <SectionHeader
          title="Shopping list"
          subtitle="Check off as you shop"
        />
        <div className="space-y-8 sm:space-y-10">
          {Object.entries(categories).map(([catName, items]) => (
            <section key={catName}>
              <h3 className="mb-4 text-lg font-bold text-ink sm:text-xl">{catName}</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id}>
                    <label className="card card-lift flex min-h-14 cursor-pointer items-center gap-4 rounded-3xl p-5 transition-all duration-200 focus-within:ring-2 focus-within:ring-sage focus-within:ring-offset-2 sm:p-6">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggle(catName, item.id)}
                        className="h-5 w-5 shrink-0 rounded-full border-cream-300 text-sage focus:ring-sage focus:ring-offset-2"
                      />
                      <span
                        className={`min-w-0 flex-1 truncate text-base font-medium leading-relaxed ${
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
