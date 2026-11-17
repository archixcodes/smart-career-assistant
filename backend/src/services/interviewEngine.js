/**
 * Adaptive Interview Engine
 * Implements FR-3-01 through FR-4-05.
 */

const { generateInterviewQuestion, evaluateInterviewAnswer } = require('./llmService');

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

/**
 * Calculates adapted difficulty based on performance score
 * Rule:
 *   Score >= 80% -> Increase difficulty
 *   Score 60-79% -> Keep steady
 *   Score < 60%  -> Decrease difficulty
 */
function getNextDifficulty(currentDiff, score) {
  const currentIndex = DIFFICULTY_ORDER.indexOf(currentDiff);
  const safeIndex = currentIndex === -1 ? 1 : currentIndex; // default to medium

  if (score >= 80) {
    return DIFFICULTY_ORDER[Math.min(DIFFICULTY_ORDER.length - 1, safeIndex + 1)];
  } else if (score < 60) {
    return DIFFICULTY_ORDER[Math.max(0, safeIndex - 1)];
  }
  return DIFFICULTY_ORDER[safeIndex];
}

/**
 * Prepares and generates the next question for an interview session
 */
async function generateNextQuestionForSession({
  session,
  cvProfile,
  jobRole,
  skillGapAnalysis
}) {
  const currentQuestionIndex = session.questions.length;
  const currentDifficulty = session.currentDifficulty || 'medium';

  const candidateSkills = cvProfile?.skills || [];
  const missingSkills = skillGapAnalysis?.missingSkills || [];
  const weakSkills = skillGapAnalysis?.weakSkills || [];

  const rawQ = await generateInterviewQuestion({
    mode: session.mode,
    targetRole: session.targetRoleTitle || jobRole?.title || 'Software Developer',
    currentDifficulty,
    questionIndex: currentQuestionIndex,
    candidateSkills,
    missingSkills,
    weakSkills,
    previousQuestions: session.questions
  });

  return {
    questionIndex: currentQuestionIndex,
    questionText: rawQ.questionText,
    category: rawQ.category || (session.mode === 'hr' ? 'hr' : 'technical'),
    targetSkill: rawQ.targetSkill || 'Core Concepts',
    difficulty: currentDifficulty,
    studentAnswer: '',
    evaluation: {
      score: null,
      instantFeedback: '',
      strengths: [],
      areasToImprove: [],
      idealAnswerSummary: ''
    }
  };
}

/**
 * Evaluates an answer submitted by the candidate and updates the session state
 */
async function processCandidateAnswer({
  session,
  questionIndex,
  studentAnswer,
  jobRole
}) {
  if (questionIndex < 0 || questionIndex >= session.questions.length) {
    throw new Error('Invalid question index');
  }

  const question = session.questions[questionIndex];
  question.studentAnswer = studentAnswer;
  question.answeredAt = new Date();

  // Evaluate the answer via LLM/Fallback
  const evalResult = await evaluateInterviewAnswer({
    targetRole: session.targetRoleTitle || jobRole?.title || 'Software Developer',
    questionText: question.questionText,
    targetSkill: question.targetSkill,
    difficulty: question.difficulty,
    studentAnswer
  });

  question.evaluation = {
    score: evalResult.score,
    instantFeedback: evalResult.instantFeedback,
    strengths: evalResult.strengths || [],
    areasToImprove: evalResult.areasToImprove || [],
    idealAnswerSummary: evalResult.idealAnswerSummary || ''
  };

  // Determine adapted difficulty for subsequent questions
  const nextDiff = getNextDifficulty(question.difficulty, evalResult.score);
  session.currentDifficulty = nextDiff;
  session.currentQuestionIndex = questionIndex + 1;

  // Check if session has reached total questions limit
  const isFinished = session.currentQuestionIndex >= session.totalQuestions;

  if (isFinished) {
    finalizeSessionSummary(session);
  }

  return {
    evaluation: question.evaluation,
    nextDifficulty: nextDiff,
    isFinished,
    currentQuestionIndex: session.currentQuestionIndex,
    totalQuestions: session.totalQuestions
  };
}

/**
 * Compiles final session performance metrics (FR-4-01 to FR-4-05)
 */
function finalizeSessionSummary(session) {
  session.status = 'completed';
  session.completedAt = new Date();

  const answeredQuestions = session.questions.filter(q => q.evaluation && q.evaluation.score !== null);
  const totalAnswered = answeredQuestions.length;

  if (totalAnswered === 0) {
    session.summary = {
      technicalScore: 0,
      hrScore: 0,
      overallScore: 0,
      weakTopics: [],
      personalizedSuggestions: ['Complete the interview session to view your comprehensive evaluation.'],
      performanceBand: 'Incomplete',
      completedQuestionsCount: 0
    };
    return;
  }

  // Calculate Technical, HR, and Overall scores
  const techQuestions = answeredQuestions.filter(q => q.category === 'technical' || q.category === 'cv_based');
  const hrQuestions = answeredQuestions.filter(q => q.category === 'hr');

  const techTotal = techQuestions.reduce((sum, q) => sum + (q.evaluation.score || 0), 0);
  const techAvg = techQuestions.length > 0 ? Math.round(techTotal / techQuestions.length) : null;

  const hrTotal = hrQuestions.reduce((sum, q) => sum + (q.evaluation.score || 0), 0);
  const hrAvg = hrQuestions.length > 0 ? Math.round(hrTotal / hrQuestions.length) : null;

  const overallTotal = answeredQuestions.reduce((sum, q) => sum + (q.evaluation.score || 0), 0);
  const overallAvg = Math.round(overallTotal / totalAnswered);

  // Identify weak topics (questions with score < 70)
  const weakTopics = [];
  answeredQuestions.forEach(q => {
    if (q.evaluation.score < 70 && q.targetSkill && !weakTopics.includes(q.targetSkill)) {
      weakTopics.push(q.targetSkill);
    }
  });

  // Performance band
  let band = 'Needs Improvement';
  if (overallAvg >= 85) band = 'Exceptional';
  else if (overallAvg >= 75) band = 'Job Ready';
  else if (overallAvg >= 60) band = 'Developing';

  // Personalized suggestions
  const personalizedSuggestions = [];
  if (weakTopics.length > 0) {
    personalizedSuggestions.push(`Dedicate focused revision to your flagged weak topics: ${weakTopics.join(', ')}.`);
  }
  if (overallAvg < 70) {
    personalizedSuggestions.push('Use the STAR method (Situation, Task, Action, Result) to format your responses with clearer practical structure.');
  }
  if (techAvg !== null && techAvg < 75) {
    personalizedSuggestions.push('In technical rounds, explicitly discuss time & space complexity (Big-O) and real-world system trade-offs.');
  }
  if (hrAvg !== null && hrAvg < 75) {
    personalizedSuggestions.push('Provide specific team leadership anecdotes and conflict resolution frameworks in behavioral questions.');
  }
  if (personalizedSuggestions.length === 0) {
    personalizedSuggestions.push('Superb interview performance! Continue maintaining readiness by simulating high-difficulty system design and live coding sessions.');
  }

  session.summary = {
    technicalScore: techAvg !== null ? techAvg : overallAvg,
    hrScore: hrAvg !== null ? hrAvg : overallAvg,
    overallScore: overallAvg,
    weakTopics,
    personalizedSuggestions,
    performanceBand: band,
    completedQuestionsCount: totalAnswered
  };
}

module.exports = {
  getNextDifficulty,
  generateNextQuestionForSession,
  processCandidateAnswer,
  finalizeSessionSummary
};
