import React from 'react';

export default function ReadinessGauge({ score = 0, tier = 'Evaluating', size = 180 }) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorClass = 'stroke-rose-500';
  let badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';

  if (clampedScore >= 80) {
    colorClass = 'stroke-emerald-500';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (clampedScore >= 60) {
    colorClass = 'stroke-sky-500';
    badgeColor = 'bg-sky-100 text-sky-800 border-sky-200';
  } else if (clampedScore >= 40) {
    colorClass = 'stroke-amber-500';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-100"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {clampedScore}%
          </span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Readiness
          </span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${badgeColor} shadow-xs`}>
        {tier}
      </div>
    </div>
  );
}
