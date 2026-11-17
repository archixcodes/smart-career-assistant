import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  History,
  MessageSquareCode,
  Award,
  ChevronRight,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function InterviewHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await interviewService.getHistory();
      if (res.success && res.sessions) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingSpinner message="Loading historical interview records..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interview Session History
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              {sessions.length} Completed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical logs of your adaptive mock interviews and evaluation scorecards
          </p>
        </div>

        <Link
          to="/interview"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-all"
        >
          <MessageSquareCode className="w-4 h-4" />
          <span>New AI Interview</span>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Interview Sessions Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Take your first mock interview to evaluate your placement readiness score and receive personalized AI feedback.
          </p>
          <Link
            to="/interview"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-all"
          >
            <span>Launch Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
          {sessions.map((sess) => {
            const dateStr = new Date(sess.completedAt || sess.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            const score = sess.summary?.overallScore || 0;
            const band = sess.summary?.performanceBand || 'Completed';

            return (
              <div
                key={sess._id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 capitalize">
                      {sess.mode} Interview
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {sess.targetRoleTitle}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {sess.questions?.length || 0} Questions
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                    </span>
                    <span>•</span>
                    <span>Performance Band: <strong>{band}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900">
                      {score}%
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Overall Score</div>
                  </div>

                  <Link
                    to={`/interview/summary/${sess._id}`}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                  >
                    <span>View Scorecard</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
