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

    const earnedBadges = snapshot.badges || [];
    const ALL_BADGES = [
        'First Cook', '3-Day Streak', 'Home Chef', 'Waste Warrior', 'Savings Starter', '7-Day Streak',
        'Recipe Explorer', 'Rescue Hero', 'Savings Pro', 'Point Master', '14-Day Streak', 'Quest Crusher',
    ];
    const unearnedBadges = ALL_BADGES.filter((b) => !earnedBadges.includes(b));

    return (
        <Link
            to="/analytics"
            className="group flex h-full flex-col justify-between rounded-2xl border border-cream-300 bg-gradient-to-br from-cream-50 to-amber/10 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-ink">Badges</h3>
                    <p className="mt-0.5 text-sm text-ink-muted">
                        {earnedBadges.length} earned
                    </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/20 text-xl">🏆</span>
            </div>

            <div className="mt-4 flex flex-1 flex-wrap content-start gap-2 overflow-hidden">
                {earnedBadges.length > 0 || unearnedBadges.length > 0 ? (
                    <>
                        {earnedBadges.map((badge, idx) => (
                            <span
                                key={`earned-${idx}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-amber-dark shadow-sm"
                            >
                                <span className="text-sm">★</span> {badge}
                            </span>
                        ))}
                        {unearnedBadges.map((badge, idx) => (
                            <span
                                key={`unearned-${idx}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-xs font-medium text-ink-muted opacity-60"
                            >
                                <span className="text-sm opacity-70">☆</span> {badge}
                            </span>
                        ))}
                    </>
                ) : (
                    <div className="flex w-full flex-col items-center justify-center gap-2 py-4 text-center">
                        <span className="text-3xl opacity-60">🎯</span>
                        <p className="text-sm font-medium text-ink-muted">Complete quests to earn badges</p>
                    </div>
                )}
            </div>
        </Link>
    );
}
