import React from 'react';
import { Link } from 'react-router-dom';
import { useFridge } from '../../context/FridgeContext';

export default function ExpiringWidget() {
    const { items: fridgeItems } = useFridge();
    const expiringSoon = fridgeItems
        .filter((i) => i.daysLeft <= 3)
        .sort((a, b) => a.daysLeft - b.daysLeft);

    return (
        <Link
            to="/fridge"
            className="card group col-span-1 row-span-2 flex min-h-[300px] flex-col rounded-3xl p-5 sm:p-6 transition-transform hover:-translate-y-1 hover:shadow-soft-lg bg-tomato/20 border-tomato/10"
        >
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-bold text-tomato-dark">Expiring Soon</h3>
            </div>

            <div className="flex-1 overflow-hidden">
                {expiringSoon.length > 0 ? (
                    <ul className="space-y-3">
                        {expiringSoon.slice(0, 5).map((item) => (
                            <li key={item.id} className="flex items-center justify-between rounded-2xl bg-white/60 p-3 shadow-sm border border-tomato/10">
                                <div className="flex items-center gap-3 truncate">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tomato/10 text-xl font-bold text-tomato-dark">
                                        {item.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                        <p className="truncate font-semibold text-ink">{item.name}</p>
                                        <p className="text-xs font-medium text-tomato-dark">
                                            {item.daysLeft === 0 ? 'Today' : `${item.daysLeft} days left`}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center opacity-70">
                        <span className="text-4xl mb-2">🥬</span>
                        <p className="text-sm font-medium text-ink-muted">Nothing expiring soon!</p>
                    </div>
                )}
            </div>

            {expiringSoon.length > 5 && (
                <p className="mt-4 text-center text-xs font-medium text-tomato-dark">
                    + {expiringSoon.length - 5} more items
                </p>
            )}
        </Link>
    );
}
