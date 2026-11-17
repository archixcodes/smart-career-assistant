import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import {
  MessageSquareCode,
  Code,
  Users,
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase
} from 'lucide-react';

const MODES = [
  {
    id: 'technical',
    title: 'Technical Round',
    icon: Code,
    color: 'sky',
    description: 'Deep dive into core algorithms, architectural patterns, system mechanics, and syntax for your target role.',
    badge: 'Code & Architecture'
  },
  {
    id: 'hr',
    title: 'HR & Behavioral',
    icon: Users,
    color: 'emerald',
    description: 'Culture fit, conflict resolution, project leadership, deadline management, and interpersonal competencies.',
    badge: 'STAR Method'
  },
  {
    id: 'cv_based',
    title: 'CV & Project Defense',
    icon: FileText,
    color: 'purple',
    description: 'Scrutinizes items on your parsed CV: technical decisions in your listed projects, tools, and experience claims.',
    badge: 'Resume Deep Dive'
  },
  {
    id: 'mixed',
    title: 'Mixed Comprehensive',
    icon: Layers,
    color: 'amber',
    description: 'Full-simulation interview combining technical questions, CV questions, and behavioral inquiries in realistic sequence.',
    badge: 'Full Mock Interview'
  }
];

const TARGET_ROLES = [
  'Software Developer',
  'Python Developer',
  'Data Analyst',
  'Web Developer',
  'Java Developer'
];

export default function InterviewSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedMode, setSelectedMode] = useState('technical');
  const [targetRoleTitle, setTargetRoleTitle] = useState(user?.targetRoleTitle || 'Software Developer');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await interviewService.startInterview({
        mode: selectedMode,
        targetRoleTitle,
        totalQuestions: Number(totalQuestions)
      });

      if (res.success && res.session?._id) {
        navigate(`/interview/session/${res.session._id}`);
      } else {
        throw new Error(res.message || 'Failed to initialize session');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error starting mock interview.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Modules 3 & 4: Adaptive Evaluation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Configure Your AI Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Choose your interview mode, target role, and question depth. Subsequent questions will adapt dynamically to your answers.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Selection Cards (FR-3-01) */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Step 1: Select Interview Mode (FR-3-01)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`cursor-pointer p-5 rounded-2xl border transition-all glass-card-hover ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-400/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{mode.title}</h3>
                      <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                        {mode.badge}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {mode.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Role & Question Count Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
        {/* Role Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-sky-600" />
            <span>Target Role Benchmark</span>
          </label>
          <select
            value={targetRoleTitle}
            onChange={(e) => setTargetRoleTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:border-sky-500 outline-none bg-slate-50"
          >
            {TARGET_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Questions prioritize skills matching this role's taxonomy and your flagged gaps.
          </p>
        </div>

        {/* Questions Count Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-sky-600" />
            <span>Interview Length</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setTotalQuestions(num)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  totalQuestions === num
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {num} Questions
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Standard simulation: 5 questions (~15 mins).
          </p>
        </div>
      </div>

      {/* Adaptive Flow Rules Info Box (FR-3-03 to FR-3-05) */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 rounded-3xl shadow-md space-y-3">
        <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Real-Time Adaptive Difficulty Mechanics (FR-3-05)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="font-bold text-emerald-300 block">Score &ge; 80%</span>
            <span className="text-slate-300 text-[11px] mt-0.5 block">
              Proves strong mastery. Difficulty escalates (Easy &rarr; Med &rarr; Hard).
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="font-bold text-sky-300 block">Score 60% – 79%</span>
            <span className="text-slate-300 text-[11px] mt-0.5 block">
              Solid grasp. Difficulty remains steady to solidify competency.
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="font-bold text-amber-300 block">Score &lt; 60%</span>
            <span className="text-slate-300 text-[11px] mt-0.5 block">
              Concept gap detected. Difficulty adapts down to test foundational intuition.
            </span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-sky-600/30 transition-all hover:scale-105 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Tailored Interview...</span>
            </>
          ) : (
            <>
              <MessageSquareCode className="w-5 h-5" />
              <span>Begin Adaptive Interview</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
