const express = require('express');
const router = express.Router();
const {
  uploadAndParseCV,
  getCVProfile,
  updateCVProfile,
  lockCVProfile,
  unlockCVProfile
} = require('../controllers/cvController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('cvFile'), uploadAndParseCV);
router.get('/profile', protect, getCVProfile);
router.put('/profile', protect, updateCVProfile);
router.post('/lock', protect, lockCVProfile);
router.post('/unlock', protect, unlockCVProfile);

module.exports = router;
