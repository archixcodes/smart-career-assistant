import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import LoadingSpinner from '../components/LoadingSpinner';
import confetti from 'canvas-confetti';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Printer,
  RotateCcw,
  LayoutDashboard,
  Code2,
  Users,
  Target
} from 'lucide-react';

export default function InterviewSummaryPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await interviewService.getSession(id);
        if (res.success && res.session) {
          setSession(res.session);

          // Confetti for score >= 75%
          const score = res.session.summary?.overallScore || 0;
          if (score >= 75) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSpinner message="Compiling comprehensive evaluation report..." size="lg" />
      </div>
    );
  }

  const summary = session?.summary || {};
  const overallScore = summary.overallScore || 0;
  const techScore = summary.technicalScore ?? overallScore;
  const hrScore = summary.hrScore ?? overallScore;
  const band = summary.performanceBand || 'Evaluated';
  const weakTopics = summary.weakTopics || [];
  const suggestions = summary.personalizedSuggestions || [];
  const questions = session?.questions || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interview Evaluation Scorecard
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Session Completed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            FR-4-01 to FR-4-05: Comprehensive performance wrap-up for <span className="font-semibold text-slate-700">{session?.targetRoleTitle}</span> ({session?.mode} mode)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <Link
            to="/interview"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Interview</span>
          </Link>
        </div>
      </div>

      {/* Aggregate Score Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-md text-center flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Overall Average</span>
            <div className="text-4xl font-extrabold mt-2 tracking-tight">{overallScore}%</div>
          </div>
          <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20">
            Band: {band}
          </div>
        </div>

        {/* Technical Score */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Technical Domain</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{techScore}%</div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Core architecture & syntax accuracy</p>
        </div>

        {/* HR / Behavioral Score */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Behavioral & HR</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{hrScore}%</div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Communication flow & STAR methodology</p>
        </div>
      </div>

      {/* Weak Topics & Personalized Suggestions Grid (FR-4-02, FR-4-03) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Topics Flagged */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Flagged Weak Topics for Revision (FR-4-02)</span>
          </h3>

          {weakTopics.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800">
              No significant topic weaknesses detected during this session! Great job.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {weakTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Personalized Preparation Suggestions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-sky-500" />
            <span>Personalized Preparation Suggestions (FR-4-03)</span>
          </h3>

          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            {suggestions.map((sug, idx) => (
              <li key={idx} className="leading-relaxed">
                {sug}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Question-by-Question Transcript Review (FR-4-04) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Question-by-Question Transcript & AI Feedback (FR-4-04)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full review of each question asked, your submitted response, score, and model answer.
          </p>
        </div>

        <div className="space-y-6 divide-y divide-slate-100">
          {questions.map((q, idx) => {
            const evalObj = q.evaluation || {};
            const qScore = evalObj.score ?? 0;
            return (
              <div key={idx} className={`${idx > 0 ? 'pt-6' : ''} space-y-3`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-400">Q{idx + 1}.</span>
                      <span className="text-xs font-bold text-slate-900">{q.questionText}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Target: <strong>{q.targetSkill || 'General'}</strong></span>
                      <span>•</span>
                      <span className="capitalize">Difficulty: <strong>{q.difficulty}</strong></span>
                    </div>
                  </div>

                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl ${
                    qScore >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : qScore >= 60
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {qScore}%
                  </span>
                </div>

                {/* Candidate Answer */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">Your Response:</span>
                  {q.studentAnswer || '(No response provided)'}
                </div>

                {/* Evaluation Feedback */}
                {evalObj.instantFeedback && (
                  <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-sky-900 leading-relaxed">
                    <span className="font-bold text-sky-950 block mb-1">Evaluator Feedback:</span>
                    {evalObj.instantFeedback}
                  </div>
                )}

                {/* Model Answer */}
                {evalObj.idealAnswerSummary && (
                  <div className="p-3.5 rounded-xl bg-slate-100/60 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-800 block mb-1">Ideal Model Answer Key:</span>
                    {evalObj.idealAnswerSummary}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>

        <Link
          to="/skill-gap"
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
        >
          <span>Review Updated Skill Gap Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
