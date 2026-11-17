import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { skillGapService } from '../services/skillGapService';
import { cvService } from '../services/cvService';
import { interviewService } from '../services/interviewService';
import ReadinessGauge from '../components/ReadinessGauge';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FileText,
  Compass,
  MessageSquareCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Unlock,
  Award,
  ChevronRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gapData, setGapData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [gapRes, profRes, histRes] = await Promise.all([
          skillGapService.getAnalysis(user?.targetRoleTitle),
          cvService.getProfile(),
          interviewService.getHistory()
        ]);

        if (gapRes.success) setGapData(gapRes.data);
        if (profRes.success) setProfile(profRes.profile);
        if (histRes.success) setRecentInterviews(histRes.sessions.slice(0, 4));
      } catch (err) {
        console.error('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.targetRoleTitle]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner message="Calculating placement readiness & analyzing metrics..." size="lg" />
      </div>
    );
  }

  const readinessScore = gapData?.readinessScore || 45;
  const readinessTier = gapData?.readinessTier || 'Evaluating';
  const skillGapPercentage = gapData?.skillGapPercentage ?? 0;
  const isProfileLocked = profile?.isLocked || false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-6 sm:p-10 shadow-xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Placement Readiness Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Targeting <span className="font-bold text-white underline decoration-sky-400 underline-offset-4">{user?.targetRoleTitle || 'Software Developer'}</span>. Review your CV extraction, address identified skill gaps, and simulate adaptive AI mock interviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/interview"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/20 transition-all hover:shadow hover:scale-[1.02]"
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>Launch AI Mock Interview</span>
            </Link>
            <Link
              to="/cv-profile"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>View CV Profile</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Placement Readiness"
          value={`${readinessScore}%`}
          badge={readinessTier.split(' ')[0]}
          color="emerald"
          progress={readinessScore}
          subtitle="Calculated from skill coverage & projects"
        />

        <StatCard
          title="Skill Gap Index"
          value={`${skillGapPercentage}%`}
          badge={skillGapPercentage < 35 ? 'Low Gap' : skillGapPercentage < 65 ? 'Moderate Gap' : 'High Gap'}
          color="amber"
          progress={100 - skillGapPercentage}
          subtitle={`${gapData?.missingSkills?.length || 0} missing, ${gapData?.weakSkills?.length || 0} weak skills`}
        />

        <StatCard
          title="Profile Verification"
          value={isProfileLocked ? 'Locked & Verified' : 'In Review'}
          badge={isProfileLocked ? 'Ready' : 'Draft'}
          color={isProfileLocked ? 'sky' : 'purple'}
          icon={isProfileLocked ? Lock : Unlock}
          subtitle={isProfileLocked ? 'Ready for recruiter screening' : 'Manual editing enabled'}
        />

        <StatCard
          title="Mock Interviews Taken"
          value={recentInterviews.length}
          badge={recentInterviews.length > 0 ? 'Active' : 'Get Started'}
          color="purple"
          icon={Award}
          subtitle="Adaptive sessions evaluated"
        />
      </div>

      {/* 2-Column Section: Readiness Gauge + Skill Matrix Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Circular Readiness Visualizer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col items-center justify-between text-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Placement Readiness Gauge</h3>
            <p className="text-xs text-slate-500 mt-1">
              Benchmark for <span className="font-semibold text-slate-700">{user?.targetRoleTitle}</span>
            </p>
          </div>

          <div className="my-6">
            <ReadinessGauge score={readinessScore} tier={readinessTier} size={190} />
          </div>

          <div className="w-full space-y-2 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Skill Matrix Match</span>
              <span className="font-bold text-slate-900">{gapData?.breakdown?.skillScore || 0} / 70 pts</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Project Relevance</span>
              <span className="font-bold text-slate-900">{gapData?.breakdown?.projectScore || 0} / 15 pts</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Profile Completeness</span>
              <span className="font-bold text-slate-900">{gapData?.breakdown?.profileScore || 0} / 15 pts</span>
            </div>
          </div>

          <Link
            to="/skill-gap"
            className="w-full mt-6 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>Deep Dive Skill Gap Breakdown</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right: Skill Matrix Breakdown (Matched, Weak, Missing) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Skill Comparison Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted CV skills vs requirements for {user?.targetRoleTitle}
                </p>
              </div>
              <Link
                to="/skill-gap"
                className="text-xs font-bold text-sky-600 hover:text-sky-500 flex items-center gap-1"
              >
                <span>View Full Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Skill Status Pills */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{gapData?.matchedSkills?.length || 0} Matched</span>
                </div>
                <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">Meets expectations</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-700 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{gapData?.weakSkills?.length || 0} Weak</span>
                </div>
                <p className="text-[10px] text-amber-600 mt-0.5 font-medium">Needs proficiency boost</p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-center">
                <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{gapData?.missingSkills?.length || 0} Missing</span>
                </div>
                <p className="text-[10px] text-rose-600 mt-0.5 font-medium">Must acquire for role</p>
              </div>
            </div>

            {/* Top Critical Action Items */}
            <div className="space-y-3 mt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Priority Action Items:
              </h4>

              {gapData?.missingSkills && gapData.missingSkills.length > 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-xs font-bold text-slate-800">
                    Highest Priority Missing Skills:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {gapData.missingSkills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {s.name} ({s.minimumProficiency || 'Intermediate'})
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {gapData?.weakSkills && gapData.weakSkills.length > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                  <p className="text-xs font-bold text-amber-900">
                    Skills Requiring Proficiency Upgrade:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {gapData.weakSkills.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {s.name} (Current: {s.candidateProficiency} &rarr; Target: {s.minimumProficiency})
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Need to test these competencies under pressure?
            </span>
            <Link
              to="/interview"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>Practice AI Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Interviews Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent AI Mock Interview Sessions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical performance trends, scores, and evaluation summaries
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-sky-600 hover:text-sky-500 flex items-center gap-1"
          >
            <span>View All Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInterviews.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <MessageSquareCode className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Mock Interviews Taken Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Simulate an adaptive interview to test your responses, receive instant feedback, and sharpen your placement readiness.
            </p>
            <Link
              to="/interview"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-sm"
            >
              <span>Start Your First Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {recentInterviews.map((sess) => {
              const score = sess.summary?.overallScore || 0;
              const completedDate = new Date(sess.completedAt || sess.createdAt).toLocaleDateString();
              return (
                <div key={sess._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 capitalize">
                        {sess.mode} Interview
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {sess.targetRoleTitle}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {completedDate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {sess.summary?.performanceBand || 'Completed'} • {sess.questions?.length || 0} questions evaluated
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">
                        {score}%
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400">Overall Score</div>
                    </div>
                    <Link
                      to={`/interview/summary/${sess._id}`}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Scorecard
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
