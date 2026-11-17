import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, badge, color = 'sky', progress }) {
  const colorStyles = {
    sky: 'from-sky-500 to-indigo-600 text-sky-600 bg-sky-50 border-sky-100',
    emerald: 'from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'from-amber-500 to-orange-600 text-amber-600 bg-amber-50 border-amber-100',
    rose: 'from-rose-500 to-pink-600 text-rose-600 bg-rose-50 border-rose-100',
    purple: 'from-purple-500 to-indigo-600 text-purple-600 bg-purple-50 border-purple-100'
  }[color] || 'from-sky-500 to-indigo-600 text-sky-600 bg-sky-50 border-sky-100';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm glass-card-hover flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
            {badge && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colorStyles.split(' ')[2]} ${colorStyles.split(' ')[1]}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${colorStyles.split(' ')[2]} ${colorStyles.split(' ')[3]}`}>
            <Icon className={`w-5 h-5 ${colorStyles.split(' ')[1]}`} />
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${colorStyles.split(' ')[0]} ${colorStyles.split(' ')[1]}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && (
        <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
