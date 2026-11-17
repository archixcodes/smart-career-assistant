const express = require('express');
const router = express.Router();
const { register, login, getMe, updateTargetRole } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/target-role', protect, updateTargetRole);

module.exports = router;
