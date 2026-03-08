import React from 'react';
import { Link } from 'react-router-dom';

export default function RecentlyExpiredWidget() {
    // Dummy data - expanded to fill the widget as a list
    const expiredItems = [
        { id: 1, name: 'Spinach', expiredDaysAgo: 2 },
        { id: 2, name: 'Whole Milk', expiredDaysAgo: 1 },
        { id: 3, name: 'Strawberries', expiredDaysAgo: 4 },
        { id: 4, name: 'Cilantro', expiredDaysAgo: 1 },
        { id: 5, name: 'Greek Yogurt', expiredDaysAgo: 3 },
    ];

    return (
        <Link
            to="/fridge"
            className="card group col-span-1 sm:col-span-2 flex flex-col rounded-3xl p-5 sm:p-6 transition-transform hover:-translate-y-1 hover:shadow-soft-lg border-2 border-cream-200 min-h-[300px]"
        >
            <div className="flex items-center gap-2 mb-4 shrink-0">
                <span className="text-xl">🗑️</span>
                <h3 className="text-lg font-bold text-ink">Recently Expired</h3>
                <span className="ml-auto rounded-full bg-ink/5 px-3 py-1 text-xs font-bold text-ink-muted hidden sm:inline-block">
                    Clear these out
                </span>
            </div>

            <div className="flex-1 overflow-hidden">
                <ul className="flex flex-col space-y-3 h-full overflow-y-auto pr-2">
                    {expiredItems.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream-100 p-3 shrink-0">
                            <div className="flex items-center gap-3 truncate">
                                <div className="truncate">
                                    <p className="truncate font-semibold text-ink line-through opacity-70">{item.name}</p>
                                    <p className="text-xs font-semibold text-rose-500 opacity-90">
                                        Expired {item.expiredDaysAgo} day{item.expiredDaysAgo > 1 ? 's' : ''} ago
                                    </p>
                                </div>
                            </div>
                            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm transition-colors group-hover/btn:bg-rose-50">
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </Link>
    );
}
