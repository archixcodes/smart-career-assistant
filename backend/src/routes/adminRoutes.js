const express = require('express');
const router = express.Router();
const {
  getAdminJobRoles,
  createJobRole,
  updateJobRole,
  deleteJobRole,
  getAdminStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Admin protected routes
router.use(protect);
router.use(authorize('admin'));

router.get('/roles', getAdminJobRoles);
router.post('/roles', createJobRole);
router.put('/roles/:id', updateJobRole);
router.delete('/roles/:id', deleteJobRole);
router.get('/stats', getAdminStats);

module.exports = router;
