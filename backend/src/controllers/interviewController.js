const DataStore = require('../config/dataStore');
const { analyzeSkillGap } = require('../services/skillGapService');
const {
  generateNextQuestionForSession,
  processCandidateAnswer,
  finalizeSessionSummary
} = require('../services/interviewEngine');

// @desc    Start a new adaptive AI mock interview session (FR-3-01, FR-3-02)
// @route   POST /api/interview/start
// @access  Private
exports.startInterview = async (req, res, next) => {
  try {
    const { mode, totalQuestions = 5, targetRoleTitle: customRoleTitle } = req.body;

    const validModes = ['technical', 'hr', 'cv_based', 'mixed'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid interview mode '${mode}'. Choose from: ${validModes.join(', ')}`
      });
    }

    const cvProfile = await DataStore.getCVProfileByUserId(req.user._id);
    const targetRoleTitle = customRoleTitle || cvProfile?.targetRoleTitle || req.user.targetRoleTitle || 'Software Developer';

    const jobRole = await DataStore.getJobRoleByTitleOrCode(targetRoleTitle);
    const skillGapAnalysis = analyzeSkillGap(cvProfile, jobRole);

    // Initial session document
    const sessionData = {
      userId: req.user._id,
      mode,
      targetRoleTitle,
      targetRoleId: jobRole ? jobRole._id : null,
      currentDifficulty: 'medium', // Default starting difficulty
      currentQuestionIndex: 0,
      totalQuestions: Number(totalQuestions) || 5,
      status: 'in_progress',
      questions: []
    };

    // Pre-generate the first question
    const firstQuestion = await generateNextQuestionForSession({
      session: sessionData,
      cvProfile,
      jobRole,
      skillGapAnalysis
    });

    sessionData.questions.push(firstQuestion);

    const createdSession = await DataStore.createInterviewSession(sessionData);

    res.status(201).json({
      success: true,
      message: 'Interview session initiated successfully.',
      session: createdSession,
      currentQuestion: firstQuestion
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit candidate answer & receive instant feedback & adaptive difficulty (FR-3-03 to FR-3-05)
// @route   POST /api/interview/:id/answer
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionIndex, answer } = req.body;

    const session = await DataStore.getInterviewSessionById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This interview session has already been completed.'
      });
    }

    const jobRole = await DataStore.getJobRoleByTitleOrCode(session.targetRoleTitle);

    // Process answer, compute evaluation and adapted difficulty
    const result = await processCandidateAnswer({
      session,
      questionIndex: Number(questionIndex),
      studentAnswer: answer,
      jobRole
    });

    // Save updated session state
    await DataStore.updateInterviewSession(id, session);

    res.status(200).json({
      success: true,
      data: {
        evaluation: result.evaluation,
        nextDifficulty: result.nextDifficulty,
        isFinished: result.isFinished,
        currentQuestionIndex: result.currentQuestionIndex,
        totalQuestions: result.totalQuestions,
        sessionSummary: result.isFinished ? session.summary : null
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Fetch next question for an ongoing session (dynamically adapted)
// @route   GET /api/interview/:id/next-question
// @access  Private
exports.getNextQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await DataStore.getInterviewSessionById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    // Check if next question is already generated
    if (session.questions.length > session.currentQuestionIndex) {
      return res.status(200).json({
        success: true,
        question: session.questions[session.currentQuestionIndex],
        session
      });
    }

    // Check if limit reached
    if (session.currentQuestionIndex >= session.totalQuestions) {
      return res.status(200).json({
        success: true,
        isFinished: true,
        session
      });
    }

    const cvProfile = await DataStore.getCVProfileByUserId(session.userId);
    const jobRole = await DataStore.getJobRoleByTitleOrCode(session.targetRoleTitle);
    const skillGapAnalysis = analyzeSkillGap(cvProfile, jobRole);

    const nextQ = await generateNextQuestionForSession({
      session,
      cvProfile,
      jobRole,
      skillGapAnalysis
    });

    session.questions.push(nextQ);
    await DataStore.updateInterviewSession(id, session);

    res.status(200).json({
      success: true,
      question: nextQ,
      session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get session details by ID
// @route   GET /api/interview/:id
// @access  Private
exports.getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await DataStore.getInterviewSessionById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Finish and wrap up interview session (FR-4-01 to FR-4-05)
// @route   POST /api/interview/:id/finish
// @access  Private
exports.finishInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await DataStore.getInterviewSessionById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    finalizeSessionSummary(session);
    const updated = await DataStore.updateInterviewSession(id, session);

    res.status(200).json({
      success: true,
      message: 'Interview session finalized successfully.',
      session: updated,
      summary: updated.summary
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate's interview history
// @route   GET /api/interview/history
// @access  Private
exports.getInterviewHistory = async (req, res, next) => {
  try {
    const sessions = await DataStore.getInterviewSessionsByUserId(req.user._id);

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (err) {
    next(err);
  }
};
