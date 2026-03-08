import React from 'react';
import { Link } from 'react-router-dom';

export default function AnalyticsWidget() {
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

  return (
    <Link to="/analytics" className="card col-span-1 sm:col-span-2 flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-transform hover:-translate-y-1 hover:shadow-soft-lg group">
      <div className="flex items-start justify-between relative z-10 w-full">
        <div>
          <h3 className="text-lg font-bold text-ink">Points Earned</h3>
          <p className="text-sm font-medium text-ink-muted">Last 7 days</p>
        </div>
        <div className="rounded-full bg-sage/20 px-3 py-1 text-sm font-bold text-sage-dark">
          +{chartData.totalWeekPoints} pts
        </div>
      </div>

      <div className="mt-6 flex-1 relative w-full h-32 sm:h-40 flex items-end">
        {/* SVG Graph container */}
        <div className="absolute inset-0 w-full h-full pb-6">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sage-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-sage, #86A789)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--color-sage, #86A789)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Soft area under the line */}
            <path
              d={areaPath}
              fill="url(#sage-gradient)"
              className="transition-all duration-500 ease-out opacity-70 group-hover:opacity-100"
            />

            {/* Vibrant Line */}
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-sage-dark, #4A5D4E)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-out"
            />

            {/* Data Dots */}
            {coords.map((c, i) => (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r="4"
                fill="#fff"
                stroke="var(--color-sage-dark, #4A5D4E)"
                strokeWidth="2"
                className="transition-all duration-300 group-hover:r-[5px] group-hover:stroke-[3px]"
              />
            ))}
          </svg>
        </div>

        {/* X-axis labels floating above the bottom */}
        <div className="w-full flex justify-between px-2 pt-2 relative z-10 border-t border-cream-200/50">
          {coords.map((c, i) => (
            <span key={i} className="text-xs font-medium text-ink-muted">{c.label}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
