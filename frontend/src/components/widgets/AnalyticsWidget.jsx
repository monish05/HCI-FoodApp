import React, { useId } from 'react';
import { Link } from 'react-router-dom';

export default function AnalyticsWidget() {
  const gradientId = `analytics-grad-${useId().replace(/:/g, '')}`;
  const chartData = {
    totalWeekPoints: 520,
    maxPoints: 130,
    points: [
      { label: 'Mon', points: 40 },
      { label: 'Tue', points: 65 },
      { label: 'Wed', points: 30 },
      { label: 'Thu', points: 90 },
      { label: 'Fri', points: 110 },
      { label: 'Sat', points: 50 },
      { label: 'Sun', points: 130 }
    ]
  };

  // SVG dimensions
  const width = 300;
  const height = 100;
  const padding = 10;

  // Calculate SVG paths
  const points = chartData.points;
  const maxPt = chartData.maxPoints;

  // Map our data points to X,Y coordinates on the SVG canvas
  const coords = points.map((pt, i) => {
    const x = padding + (i * ((width - padding * 2) / (points.length - 1)));
    const y = height - padding - ((pt.points / maxPt) * (height - padding * 2));
    return { x, y, value: pt.points, label: pt.label };
  });

  // Build the line path
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

  // Build the area path (line path closed at the bottom)
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  // Theme colors: sage #6BAF92, sage-dark #559278, sage-light #8BC4A8, cream #F9F7F2
  const sage = '#6BAF92'
  const sageDark = '#559278'
  const sageLight = '#8BC4A8'
  const cream = '#F9F7F2'

  return (
    <Link to="/analytics" className="card flex flex-col justify-between rounded-2xl border border-cream-300 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg group">
      <div className="flex items-start justify-between relative z-10 w-full">
        <div>
          <h3 className="text-lg font-bold text-ink">Points Earned</h3>
          <p className="text-sm font-medium text-ink-muted">Last 7 days</p>
        </div>
        <div className="rounded-xl bg-sage/15 px-3 py-1.5 text-sm font-bold text-sage-dark">
          +{chartData.totalWeekPoints} pts
        </div>
      </div>

      <div className="mt-6 flex-1 min-h-[140px] w-full">
        <div className="h-28 sm:h-36 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sage} stopOpacity="0.5" />
                <stop offset="100%" stopColor={sageLight} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <path
              d={areaPath}
              fill={`url(#${gradientId})`}
              className="transition-all duration-500 ease-out group-hover:opacity-90"
            />

            <path
              d={linePath}
              fill="none"
              stroke={sageDark}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-out"
            />

            {coords.map((c, i) => (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r="4"
                fill={cream}
                stroke={sageDark}
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
        <div className="flex w-full justify-between border-t border-cream-300 pt-2">
          {coords.map((c, i) => (
            <span key={i} className="text-xs font-medium text-ink-muted">{c.label}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
