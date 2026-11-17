const jwt = require('jsonwebtoken');
const DataStore = require('../config/dataStore');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_smart_career_jwt_token_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user (Student or Admin)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, targetRoleTitle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    // Check if user already exists
    const existing = await DataStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';

    // Create user
    const user = await DataStore.createUser({
      name,
      email,
      password,
      role: assignedRole,
      targetRoleTitle: targetRoleTitle || 'Software Developer'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRoleTitle: user.targetRoleTitle
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.'
      });
    }

    const user = await DataStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRoleTitle: user.targetRoleTitle || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await DataStore.findUserById(req.user._id);
    const cvProfile = await DataStore.getCVProfileByUserId(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRoleTitle: user.targetRoleTitle,
        hasProfile: !!cvProfile,
        isProfileLocked: cvProfile?.isLocked || false
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student's target job role (FR-1-06)
// @route   PUT /api/auth/target-role
// @access  Private
exports.updateTargetRole = async (req, res, next) => {
  try {
    const { targetRoleTitle } = req.body;

    if (!targetRoleTitle) {
      return res.status(400).json({
        success: false,
        message: 'Target role title is required.'
      });
    }

    const matchedRole = await DataStore.getJobRoleByTitleOrCode(targetRoleTitle);
    const roleTitleToSet = matchedRole ? matchedRole.title : targetRoleTitle;

    // Update user
    const updatedUser = await DataStore.updateUser(req.user._id, {
      targetRoleTitle: roleTitleToSet,
      targetRoleId: matchedRole ? matchedRole._id : null
    });

    // Also update CVProfile target role if exists
    const cvProfile = await DataStore.getCVProfileByUserId(req.user._id);
    if (cvProfile) {
      await DataStore.saveOrUpdateCVProfile(req.user._id, {
        targetRoleTitle: roleTitleToSet,
        targetRoleId: matchedRole ? matchedRole._id : null
      });
    }

    res.status(200).json({
      success: true,
      message: `Target role updated to ${roleTitleToSet}`,
      targetRoleTitle: roleTitleToSet
    });
  } catch (err) {
    next(err);
  }
};
