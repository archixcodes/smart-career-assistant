import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { skillGapService } from '../services/skillGapService';
import ReadinessGauge from '../components/ReadinessGauge';
import SkillBadge from '../components/SkillBadge';
import RoadmapView from '../components/RoadmapView';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  HelpCircle,
  Layers,
  MessageSquareCode
} from 'lucide-react';

const TARGET_ROLES = [
  'Software Developer',
  'Python Developer',
  'Data Analyst',
  'Web Developer',
  'Java Developer'
];

export default function SkillGapPage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.targetRoleTitle || 'Software Developer');
  const [loading, setLoading] = useState(true);
  const [gapData, setGapData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'matched', 'weak', 'missing'

  useEffect(() => {
    fetchAnalysis(selectedRole);
  }, [selectedRole]);

  const fetchAnalysis = async (role) => {
    setLoading(true);
    try {
      const res = await skillGapService.getAnalysis(role);
      if (res.success && res.data) {
        setGapData(res.data);
      }
    } catch (err) {
      console.error('Error fetching skill gap analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !gapData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner message="Calculating skill gap & readiness score..." size="lg" />
      </div>
    );
  }

  const matchedSkills = gapData?.matchedSkills || [];
  const weakSkills = gapData?.weakSkills || [];
  const missingSkills = gapData?.missingSkills || [];
  const readinessScore = gapData?.readinessScore || 0;
  const readinessTier = gapData?.readinessTier || 'Evaluating';
  const skillGapPercentage = gapData?.skillGapPercentage || 0;

  // Filter skills for list
  let displayedSkills = [];
  if (activeFilter === 'all') {
    displayedSkills = [
      ...weakSkills.map(s => ({ ...s, status: 'weak' })),
      ...missingSkills.map(s => ({ ...s, status: 'missing' })),
      ...matchedSkills.map(s => ({ ...s, status: 'matched' }))
    ];
  } else if (activeFilter === 'matched') {
    displayedSkills = matchedSkills.map(s => ({ ...s, status: 'matched' }));
  } else if (activeFilter === 'weak') {
    displayedSkills = weakSkills.map(s => ({ ...s, status: 'weak' }));
  } else if (activeFilter === 'missing') {
    displayedSkills = missingSkills.map(s => ({ ...s, status: 'missing' }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Skill Gap Analyzer & Readiness Score
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              Module 2
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            FR-2-01 to FR-2-06: Automated skill matching, gap index calculation, and placement roadmap.
          </p>
        </div>

        {/* Interactive Role Simulator Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden lg:inline">
            Simulate Role:
          </span>
          {TARGET_ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                selectedRole === r
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Gauges & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Placement Readiness Radial Gauge */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col items-center justify-between text-center">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Overall Benchmark
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Placement Readiness Score
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated against <span className="font-semibold text-slate-800">{selectedRole}</span> matrix
            </p>
          </div>

          <div className="my-6">
            <ReadinessGauge score={readinessScore} tier={readinessTier} size={190} />
          </div>

          <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            <div>
              <div className="text-xs font-bold text-slate-900">{gapData?.breakdown?.skillScore || 0}%</div>
              <div className="text-[10px] text-slate-500">Skills Fit</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{gapData?.breakdown?.projectScore || 0}%</div>
              <div className="text-[10px] text-slate-500">Projects</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{gapData?.breakdown?.profileScore || 0}%</div>
              <div className="text-[10px] text-slate-500">Credentials</div>
            </div>
          </div>
        </div>

        {/* Right: Gap Percentage & Comparative Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Skill Gap Metric (FR-2-05)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Percentage of required competency lacking for immediate placement
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900">{skillGapPercentage}%</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Skill Gap Index</span>
              </div>
            </div>

            {/* Gap Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-emerald-700">Matched Coverage: {100 - skillGapPercentage}%</span>
                <span className="text-rose-700">Deficit Gap: {skillGapPercentage}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-rose-100 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${100 - skillGapPercentage}%` }}
                />
                <div
                  className="h-full bg-rose-500 transition-all duration-700"
                  style={{ width: `${skillGapPercentage}%` }}
                />
              </div>
            </div>

            {/* Category Statistics */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <button
                onClick={() => setActiveFilter('matched')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  activeFilter === 'matched'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20'
                    : 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Matched Skills</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-900 mt-1">
                  {matchedSkills.length}
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">Meets benchmark</div>
              </button>

              <button
                onClick={() => setActiveFilter('weak')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  activeFilter === 'weak'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20'
                    : 'bg-amber-50/50 border-amber-100 hover:bg-amber-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Weak Skills</span>
                </div>
                <div className="text-2xl font-extrabold text-amber-900 mt-1">
                  {weakSkills.length}
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">Below expected level</div>
              </button>

              <button
                onClick={() => setActiveFilter('missing')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  activeFilter === 'missing'
                    ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20'
                    : 'bg-rose-50/50 border-rose-100 hover:bg-rose-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Missing Skills</span>
                </div>
                <div className="text-2xl font-extrabold text-rose-900 mt-1">
                  {missingSkills.length}
                </div>
                <div className="text-[11px] text-rose-700 mt-0.5">Not found on CV</div>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Target these gaps with dynamic AI questions tailored to {selectedRole}.
            </span>
            <Link
              to="/interview"
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-xs"
            >
              <MessageSquareCode className="w-3.5 h-3.5" />
              <span>Practice AI Interview for Gaps</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Skill Comparison Matrix List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Detailed Skill Comparison Matrix (FR-2-01 to FR-2-04)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {displayedSkills.length} competencies for {selectedRole}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {['all', 'missing', 'weak', 'matched'].map((flt) => (
              <button
                key={flt}
                onClick={() => setActiveFilter(flt)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                  activeFilter === flt
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>

        {displayedSkills.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No skills match this filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedSkills.map((s, idx) => (
              <SkillBadge key={idx} skill={s} status={s.status} showCategory={true} />
            ))}
          </div>
        )}
      </div>

      {/* Tailored Career Roadmap Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-600" />
              <span>Tailored Career Learning Roadmap</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized curriculum prioritizes stages containing your identified skill gaps
            </p>
          </div>
        </div>

        <RoadmapView roadmap={gapData?.roadmap || []} targetRole={selectedRole} />
      </div>

      {/* Personalized AI Recommendations */}
      {gapData?.recommendations && gapData.recommendations.length > 0 && (
        <div className="bg-gradient-to-tr from-sky-50 via-white to-indigo-50/30 rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-4">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>AI Placement Action Plan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gapData.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  {rec.type.replace('_', ' ')}
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{rec.title}</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
