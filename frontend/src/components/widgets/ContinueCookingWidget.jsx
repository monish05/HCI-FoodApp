import React from 'react';
import { Link } from 'react-router-dom';

export default function ContinueCookingWidget() {
    // This is a dummy object, but we route to the active cooking route.
    // In a full app, this would be fetched from the backend (i.e activeSession.recipeId)
    // We'll use a hardcoded valid looking MongoDB ObjectId for the prototype
    const mockRecipeId = "64b5f42c1234567890abcdef";

    return (
        <Link
            to={`/cooking/${mockRecipeId}`}
            className="card group col-span-1 block overflow-hidden rounded-3xl transition-transform hover:-translate-y-1 hover:shadow-soft-lg flex flex-col"
        >
            <div className="relative aspect-[4/3] bg-cream-200">
                <img
                    src="https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=600&h=450"
                    alt="Roasted Vegetable Lasagna"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    Continue Cooking
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
                <h3 className="line-clamp-2 text-lg font-bold text-ink">Roasted Vegetable Lasagna</h3>
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 overflow-hidden rounded-full bg-cream-200 h-2">
                        <div className="h-full rounded-full bg-sage w-1/2" />
                    </div>
                    <span className="text-xs font-bold text-sage-dark">50%</span>
                </div>
            </div>
        </Link>
    );
}
