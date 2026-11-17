const DataStore = require('../config/dataStore');

// @desc    Get all job roles for Admin
// @route   GET /api/admin/roles
// @access  Private (Admin)
exports.getAdminJobRoles = async (req, res, next) => {
  try {
    const roles = await DataStore.getAllJobRoles();
    res.status(200).json({
      success: true,
      roles
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new job role with required skill sets (FR-5-01)
// @route   POST /api/admin/roles
// @access  Private (Admin)
exports.createJobRole = async (req, res, next) => {
  try {
    const { title, description, category, requiredSkills, roadmap } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Job role title and description are required.'
      });
    }

    const code = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await DataStore.getJobRoleByTitleOrCode(code);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A job role with title or code '${title}' already exists.`
      });
    }

    const newRole = await DataStore.createJobRole({
      title,
      code,
      description,
      category: category || 'Engineering',
      requiredSkills: requiredSkills || [],
      roadmap: roadmap || []
    });

    res.status(201).json({
      success: true,
      message: 'Job role created successfully.',
      role: newRole
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update existing job role and skill matrix (FR-5-02)
// @route   PUT /api/admin/roles/:id
// @access  Private (Admin)
exports.updateJobRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, requiredSkills, roadmap, isActive } = req.body;

    const existing = await DataStore.getJobRoleById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Job role not found.'
      });
    }

    const updates = {};
    if (title) {
      updates.title = title;
      updates.code = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (requiredSkills !== undefined) updates.requiredSkills = requiredSkills;
    if (roadmap !== undefined) updates.roadmap = roadmap;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await DataStore.updateJobRole(id, updates);

    res.status(200).json({
      success: true,
      message: 'Job role updated successfully.',
      role: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or deactivate job role
// @route   DELETE /api/admin/roles/:id
// @access  Private (Admin)
exports.deleteJobRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await DataStore.deleteJobRole(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Job role not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job role deleted/deactivated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get aggregate platform metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const roles = await DataStore.getAllJobRoles();
    const sessions = await DataStore.getAllInterviewSessions();

    const completed = sessions.filter(s => s.status === 'completed');
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((acc, s) => acc + (s.summary?.overallScore || 0), 0) / completed.length)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalJobRoles: roles.length,
        totalInterviews: sessions.length,
        completedInterviews: completed.length,
        averageInterviewScore: avgScore,
        recentSessions: sessions.slice(0, 8)
      }
    });
  } catch (err) {
    next(err);
  }
};
