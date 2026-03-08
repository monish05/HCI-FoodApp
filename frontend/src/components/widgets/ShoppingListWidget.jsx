import React from 'react';
import { Link } from 'react-router-dom';
import { useShopping } from '../../context/ShoppingContext';

export default function ShoppingListWidget() {
    const { categories } = useShopping();

    // Flatten categories into a single list
    const shoppingItems = Object.values(categories || {}).flat().filter(item => !item.checked);

    return (
        <Link
            to="/shopping-list"
            className="card group col-span-1 row-span-2 flex min-h-[300px] flex-col rounded-3xl p-5 sm:p-6 transition-transform hover:-translate-y-1 hover:shadow-soft-lg bg-sage/20 border-sage/10"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-sage-dark border-b-2 border-transparent">Shopping List</h3>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/20 text-sm font-bold text-sage-dark shrink-0">
                    {shoppingItems.length}
                </span>
            </div>

            <div className="flex-1 overflow-hidden">
                {shoppingItems.length > 0 ? (
                    <ul className="space-y-3">
                        {shoppingItems.slice(0, 7).map((item) => (
                            <li key={item.id} className="flex flex-col rounded-2xl bg-white/60 p-3 shadow-sm border border-sage/10">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 shrink-0 rounded border-2 border-sage/40 bg-white" />
                                    <span className="truncate font-medium text-ink">{item.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center opacity-70">
                        <span className="text-4xl mb-2">🛒</span>
                        <p className="text-sm font-medium text-ink-muted">Your list is empty.</p>
                    </div>
                )}
            </div>

            {shoppingItems.length > 7 && (
                <p className="mt-4 text-center text-xs font-medium text-sage-dark">
                    + {shoppingItems.length - 7} more items
                </p>
            )}
        </Link>
    );
}
