import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function SkillBadge({ skill, status = 'matched', showCategory = true }) {
  const styles = {
    matched: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      tag: 'bg-emerald-100 text-emerald-700',
      label: 'Matched'
    },
    weak: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      tag: 'bg-amber-100 text-amber-700',
      label: 'Needs Boost'
    },
    missing: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: XCircle,
      iconColor: 'text-rose-600',
      tag: 'bg-rose-100 text-rose-700',
      label: 'Missing'
    }
  }[status] || {
    bg: 'bg-slate-50 border-slate-200 text-slate-800',
    icon: CheckCircle2,
    iconColor: 'text-slate-600',
    tag: 'bg-slate-100 text-slate-700',
    label: 'Skill'
  };

  const Icon = styles.icon;

  return (
    <div className={`flex items-start justify-between p-3 rounded-xl border ${styles.bg} transition-all`}>
      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{skill.name}</span>
            {showCategory && skill.category && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/70 text-slate-600 border border-slate-200/60">
                {skill.category}
              </span>
            )}
          </div>
          {skill.description && (
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              {skill.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            {status === 'matched' && (
              <span className="text-emerald-700 font-medium">
                Proficiency: <strong>{skill.candidateProficiency || 'Satisfied'}</strong>
              </span>
            )}
            {status === 'weak' && (
              <span className="text-amber-700 font-medium">
                Current: <strong>{skill.candidateProficiency}</strong> &rarr; Target: <strong>{skill.minimumProficiency}</strong>
              </span>
            )}
            {status === 'missing' && (
              <span className="text-rose-700 font-medium">
                Required Level: <strong>{skill.minimumProficiency || 'Intermediate'}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.tag}`}>
        {styles.label}
      </span>
    </div>
  );
}
