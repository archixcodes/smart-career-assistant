import React from 'react';
import { CheckCircle2, Clock, ArrowRight, Flame } from 'lucide-react';

export default function RoadmapView({ roadmap = [], targetRole = '' }) {
  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">No roadmap stages configured for this role yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {roadmap.map((stage, idx) => {
        const isPriority = stage.isPriority;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border transition-all ${
              isPriority
                ? 'bg-amber-50/60 border-amber-200/90 shadow-sm'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs ${
                    isPriority
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {stage.step || idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{stage.title}</span>
                    {isPriority && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <Flame className="w-3 h-3 text-amber-600" />
                        Focus Area
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Est. Duration: {stage.duration || '3-4 weeks'}</span>
                  </div>
                </div>
              </div>

              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                isPriority
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {isPriority ? 'Skill Gap Detected' : 'Foundational'}
              </span>
            </div>

            {/* Topics */}
            {stage.topics && stage.topics.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
                {stage.topics.map((topic, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs"
                  >
                    • {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
