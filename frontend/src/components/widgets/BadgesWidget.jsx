import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loadAnalyticsSnapshot, getAnalyticsSnapshot } from '../../utils/engagementAnalytics';

export default function BadgesWidget() {
    const auth = useAuth();
    const [snapshot, setSnapshot] = useState(() => getAnalyticsSnapshot());

    useEffect(() => {
        let isMounted = true;
        async function load() {
            if (auth.token) {
                try {
                    const data = await loadAnalyticsSnapshot(auth.token);
                    if (isMounted) setSnapshot(data);
                } catch (e) {
                    // Ignore
                }
            }
        }
        load();
        return () => { isMounted = false; };
    }, [auth.token]);

    const badges = snapshot.badges || [];

    return (
        <Link
            to="/analytics"
            className="card group col-span-1 flex flex-col justify-between rounded-3xl bg-amber-500/20 border-amber-500/20 p-5 sm:p-6 transition-transform hover:-translate-y-1 hover:shadow-soft-lg"
        >
            <div>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-amber-700">Badges</h3>
                    <span className="text-2xl">🏆</span>
                </div>
                <p className="mt-1 text-sm font-medium text-amber-900/60">
                    {badges.length} earned
                </p>
            </div>

            <div className="mt-4 flex flex-1 flex-wrap items-end gap-2 overflow-hidden">
                {badges.length > 0 ? (
                    badges.slice(0, 3).map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm border border-amber-500/20">
                            <span className="text-sm">🌟</span> {badge}
                        </div>
                    ))
                ) : (
                    <p className="text-xs font-medium text-amber-900/60 w-full text-center pb-2">Complete quests to earn badges!</p>
                )}
                {badges.length > 3 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-700">
                        +{badges.length - 3}
                    </div>
                )}
            </div>
        </Link>
    );
}
