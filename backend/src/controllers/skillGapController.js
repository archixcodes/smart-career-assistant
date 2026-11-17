const DataStore = require('../config/dataStore');
const { analyzeSkillGap } = require('../services/skillGapService');

// @desc    Perform skill gap analysis for current authenticated user
// @route   GET /api/gap-analysis
// @access  Private
exports.getSkillGapAnalysis = async (req, res, next) => {
  try {
    const profile = await DataStore.getCVProfileByUserId(req.user._id);
    const targetRoleTitle = req.query.role || profile?.targetRoleTitle || req.user.targetRoleTitle || 'Software Developer';

    const jobRole = await DataStore.getJobRoleByTitleOrCode(targetRoleTitle);

    if (!jobRole) {
      return res.status(404).json({
        success: false,
        message: `Job role '${targetRoleTitle}' not found in the matrix database.`
      });
    }

    const analysis = analyzeSkillGap(profile, jobRole);

    res.status(200).json({
      success: true,
      data: {
        ...analysis,
        isProfileLocked: profile?.isLocked || false,
        hasProfile: !!profile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all available target job roles with required skills summary
// @route   GET /api/gap-analysis/roles
// @access  Public / Private
exports.getAvailableJobRoles = async (req, res, next) => {
  try {
    const roles = await DataStore.getAllJobRoles();

    res.status(200).json({
      success: true,
      roles: roles.map(r => ({
        id: r._id,
        title: r.title,
        code: r.code,
        category: r.category,
        description: r.description,
        requiredSkillsCount: (r.requiredSkills || []).length,
        requiredSkills: r.requiredSkills || [],
        roadmap: r.roadmap || []
      }))
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Simulate gap analysis for any selected job role
// @route   POST /api/gap-analysis/simulate
// @access  Private
exports.simulateRoleGap = async (req, res, next) => {
  try {
    const { roleTitle } = req.body;

    if (!roleTitle) {
      return res.status(400).json({
        success: false,
        message: 'roleTitle is required for simulation.'
      });
    }

    const jobRole = await DataStore.getJobRoleByTitleOrCode(roleTitle);
    if (!jobRole) {
      return res.status(404).json({
        success: false,
        message: `Job role '${roleTitle}' not found.`
      });
    }

    const profile = await DataStore.getCVProfileByUserId(req.user._id);
    const analysis = analyzeSkillGap(profile, jobRole);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
};
