const express = require('express');
const router = express.Router();
const {
  getSkillGapAnalysis,
  getAvailableJobRoles,
  simulateRoleGap
} = require('../controllers/skillGapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSkillGapAnalysis);
router.get('/roles', getAvailableJobRoles);
router.post('/simulate', protect, simulateRoleGap);

module.exports = router;
