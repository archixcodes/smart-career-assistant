import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import LoadingSpinner from '../components/LoadingSpinner';
import AudioWave from '../components/AudioWave';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Equal
} from 'lucide-react';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [nextDifficulty, setNextDifficulty] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // Audio Features
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Elapsed timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    loadSession();

    // Setup Web Speech API Speech Recognition if supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setStudentAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognizer.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [id]);

  // Timer counter
  useEffect(() => {
    let interval = null;
    if (!currentEvaluation && !loading) {
      interval = setInterval(() => {
        setSecondsElapsed((sec) => sec + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentEvaluation, loading]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const res = await interviewService.getSession(id);
      if (res.success && res.session) {
        setSession(res.session);

        const currentIdx = res.session.currentQuestionIndex || 0;
        const q = res.session.questions?.[currentIdx];

        if (q) {
          setCurrentQuestion(q);
          if (q.evaluation && q.evaluation.score !== null) {
            setCurrentEvaluation(q.evaluation);
            setStudentAnswer(q.studentAnswer || '');
          } else {
            setCurrentEvaluation(null);
            setStudentAnswer('');
            setSecondsElapsed(0);
          }
        } else if (res.session.status === 'completed') {
          navigate(`/interview/summary/${id}`);
        } else {
          // Fetch next generated question
          fetchNextQuestion();
        }
      }
    } catch (err) {
      console.error('Session load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextQuestion = async () => {
    setLoading(true);
    try {
      const res = await interviewService.getNextQuestion(id);
      if (res.isFinished || (res.session && res.session.currentQuestionIndex >= res.session.totalQuestions)) {
        navigate(`/interview/summary/${id}`);
      } else if (res.question) {
        setCurrentQuestion(res.question);
        setCurrentEvaluation(null);
        setStudentAnswer('');
        setSecondsElapsed(0);
        if (res.session) setSession(res.session);
      }
    } catch (err) {
      console.error('Error fetching next question:', err);
    } finally {
      setLoading(false);
    }
  };

  // Text to speech (Read question aloud)
  const toggleSpeechSynthesis = () => {
    if (!('speechSynthesis' in window) || !currentQuestion) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech to text (Dictation toggle)
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your answer directly.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  // Submit candidate answer
  const handleSubmitAnswer = async () => {
    if (!studentAnswer || studentAnswer.trim().length < 5) {
      alert('Please provide a substantive answer to evaluate.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setEvaluating(true);
    try {
      const qIdx = currentQuestion.questionIndex !== undefined ? currentQuestion.questionIndex : (session?.currentQuestionIndex || 0);
      const res = await interviewService.submitAnswer(id, qIdx, studentAnswer);

      if (res.success && res.data) {
        setCurrentEvaluation(res.data.evaluation);
        setNextDifficulty(res.data.nextDifficulty);
        setIsFinished(res.data.isFinished);
      }
    } catch (err) {
      console.error('Answer evaluation failed:', err);
      alert('Evaluation error. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  // Proceed to next question or finalize
  const handleProceed = async () => {
    if (isFinished) {
      await interviewService.finishInterview(id);
      navigate(`/interview/summary/${id}`);
    } else {
      fetchNextQuestion();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSpinner message="Preparing adaptive interview question..." size="lg" />
      </div>
    );
  }

  const qNumber = (currentQuestion?.questionIndex !== undefined ? currentQuestion.questionIndex : session?.currentQuestionIndex || 0) + 1;
  const totalQ = session?.totalQuestions || 5;
  const diff = currentQuestion?.difficulty || session?.currentDifficulty || 'medium';

  const diffBadgeColor = {
    easy: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    medium: 'bg-sky-100 text-sky-800 border-sky-300',
    hard: 'bg-purple-100 text-purple-800 border-purple-300'
  }[diff] || 'bg-slate-100 text-slate-800';

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Adaptive Progress Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {session?.mode} Round
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-600">
              {session?.targetRoleTitle}
            </span>
          </div>
          <div className="text-sm font-extrabold text-slate-900 mt-0.5">
            Question {qNumber} of {totalQ}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Difficulty Badge (FR-3-05) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Difficulty:</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${diffBadgeColor}`}>
              {diff}
            </span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-500"
          style={{ width: `${(qNumber / totalQ) * 100}%` }}
        />
      </div>

      {/* Active Audio Wave indicator (if listening or speaking) */}
      <AudioWave isListening={isListening} isSpeaking={isSpeaking} />

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            Target Competency: {currentQuestion?.targetSkill || 'General'}
          </span>

          <button
            type="button"
            onClick={toggleSpeechSynthesis}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isSpeaking
                ? 'bg-rose-100 text-rose-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Listen to question spoken aloud"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {currentQuestion?.questionText}
        </h2>
      </div>

      {/* Answer Area (only if not evaluated yet) */}
      {!currentEvaluation && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Your Response (Typed or Spoken)
            </label>

            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? 'Stop Mic Dictation' : 'Voice Dictation (Mic)'}</span>
            </button>
          </div>

          <textarea
            rows={6}
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Structure your answer clearly: state core definitions, technical mechanisms, trade-offs, and practical examples..."
            className="w-full text-sm leading-relaxed p-4 rounded-2xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all resize-y"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Word count: {studentAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </span>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={evaluating || studentAnswer.trim().length < 5}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all disabled:opacity-40"
            >
              {evaluating ? (
                <>
                  <LoadingSpinner size="sm" message="" />
                  <span>AI Evaluating Response...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Answer for Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Instant Evaluation Card (FR-3-03, FR-3-04) */}
      {currentEvaluation && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Instant AI Evaluation & Feedback
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Evaluation Score: {currentEvaluation.score}%
              </h3>
            </div>

            {/* Adaptive Difficulty Adjustment Pill (FR-3-05) */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
              {currentEvaluation.score >= 80 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Score &ge; 80%: Next Difficulty Increased to {nextDifficulty || 'Hard'}</span>
                </div>
              ) : currentEvaluation.score >= 60 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
                  <Equal className="w-4 h-4 text-sky-600" />
                  <span>Score 60-79%: Difficulty Kept Steady at {nextDifficulty || 'Medium'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                  <span>Score &lt; 60%: Difficulty Adapted Down to {nextDifficulty || 'Easy'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Instant Feedback Text */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 text-xs text-sky-900 leading-relaxed font-medium">
            {currentEvaluation.instantFeedback}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demonstrated Strengths</span>
              </h4>
              <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside">
                {(currentEvaluation.strengths || []).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Areas for Improvement</span>
              </h4>
              <ul className="text-xs text-amber-950 space-y-1 list-disc list-inside">
                {(currentEvaluation.areasToImprove || []).map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ideal Answer Summary */}
          {currentEvaluation.idealAnswerSummary && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Ideal Model Response Coverage</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentEvaluation.idealAnswerSummary}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleProceed}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              <span>{isFinished ? 'View Comprehensive Scorecard' : 'Proceed to Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
