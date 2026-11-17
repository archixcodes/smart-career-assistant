const mongoose = require('mongoose');

const questionItemSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'hr', 'cv_based'],
    default: 'technical'
  },
  targetSkill: {
    type: String,
    default: 'General'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  studentAnswer: {
    type: String,
    default: ''
  },
  answeredAt: {
    type: Date,
    default: null
  },
  evaluation: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    instantFeedback: {
      type: String,
      default: ''
    },
    strengths: [{
      type: String
    }],
    areasToImprove: [{
      type: String
    }],
    idealAnswerSummary: {
      type: String,
      default: ''
    }
  }
});

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mode: {
      type: String,
      enum: ['technical', 'hr', 'cv_based', 'mixed'],
      required: true
    },
    targetRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRole',
      default: null
    },
    targetRoleTitle: {
      type: String,
      default: ''
    },
    currentDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 5
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress'
    },
    questions: [questionItemSchema],
    summary: {
      technicalScore: { type: Number, default: 0 },
      hrScore: { type: Number, default: 0 },
      overallScore: { type: Number, default: 0 },
      weakTopics: [{ type: String }],
      personalizedSuggestions: [{ type: String }],
      performanceBand: { type: String, default: 'Evaluating' },
      completedQuestionsCount: { type: Number, default: 0 }
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
