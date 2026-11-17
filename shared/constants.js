/**
 * Shared constants for Smart Career Assistant
 */
module.exports = {
  ROLES: {
    STUDENT: 'student',
    ADMIN: 'admin'
  },
  TARGET_JOB_ROLES: [
    'Software Developer',
    'Python Developer',
    'Data Analyst',
    'Web Developer',
    'Java Developer'
  ],
  INTERVIEW_MODES: {
    TECHNICAL: 'technical',
    HR: 'hr',
    CV_BASED: 'cv_based',
    MIXED: 'mixed'
  },
  DIFFICULTY_LEVELS: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
  },
  PROFICIENCY_LEVELS: {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
    EXPERT: 'Expert'
  },
  SCORING_THRESHOLDS: {
    INCREASE_DIFFICULTY: 80, // Score >= 80% increases difficulty
    KEEP_STEADY_MIN: 60,     // 60-79% keeps it steady
    DECREASE_DIFFICULTY: 59   // < 60% decreases difficulty
  }
};
