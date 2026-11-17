const express = require('express');
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  getNextQuestion,
  getSessionById,
  finishInterview,
  getInterviewHistory
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startInterview);
router.get('/history', protect, getInterviewHistory);
router.get('/:id', protect, getSessionById);
router.get('/:id/next-question', protect, getNextQuestion);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/finish', protect, finishInterview);

module.exports = router;
