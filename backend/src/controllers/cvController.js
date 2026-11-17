const path = require('path');
const DataStore = require('../config/dataStore');
const { extractTextFromPDF, parseResumeText } = require('../services/pdfParserService');
const { refineParsedCV } = require('../services/llmService');

// @desc    Upload PDF resume and extract structured fields (FR-1-03 to FR-1-05)
// @route   POST /api/cv/upload
// @access  Private
exports.uploadAndParseCV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid PDF resume file.'
      });
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;

    // 1. Extract raw text from PDF
    const rawText = await extractTextFromPDF(filePath);

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from the uploaded PDF. Please ensure it is not an image-only scan.'
      });
    }

    // 2. Perform heuristic taxonomy parsing
    const parsedHeuristic = parseResumeText(rawText);

    // 3. AI Refinement (OpenAI / Gemini / intelligent fallback)
    const refinedData = await refineParsedCV(rawText, parsedHeuristic);

    // 4. Merge or persist into CV Profile
    const existingProfile = await DataStore.getCVProfileByUserId(req.user._id);
    const targetRoleTitle = existingProfile?.targetRoleTitle || req.user.targetRoleTitle || 'Software Developer';

    const profilePayload = {
      fullName: refinedData.fullName || req.user.name,
      email: refinedData.email || req.user.email,
      phone: refinedData.phone || existingProfile?.phone || '',
      location: refinedData.location || existingProfile?.location || '',
      summary: refinedData.summary || existingProfile?.summary || '',
      targetRoleTitle,
      skills: refinedData.skills && refinedData.skills.length > 0 ? refinedData.skills : parsedHeuristic.skills,
      education: refinedData.education && refinedData.education.length > 0 ? refinedData.education : parsedHeuristic.education,
      projects: refinedData.projects && refinedData.projects.length > 0 ? refinedData.projects : parsedHeuristic.projects,
      certifications: refinedData.certifications && refinedData.certifications.length > 0 ? refinedData.certifications : parsedHeuristic.certifications,
      originalFileName,
      fileUrl: `/uploads/${path.basename(filePath)}`,
      rawParsedText: rawText.slice(0, 5000),
      isLocked: false // Always allow review after new upload
    };

    const savedProfile = await DataStore.saveOrUpdateCVProfile(req.user._id, profilePayload);

    res.status(200).json({
      success: true,
      message: 'CV uploaded and successfully parsed. Please review and edit the extracted details before locking.',
      profile: savedProfile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's CV Profile
// @route   GET /api/cv/profile
// @access  Private
exports.getCVProfile = async (req, res, next) => {
  try {
    let profile = await DataStore.getCVProfileByUserId(req.user._id);

    if (!profile) {
      // Return a blank template if not yet uploaded
      return res.status(200).json({
        success: true,
        hasProfile: false,
        profile: {
          fullName: req.user.name,
          email: req.user.email,
          phone: '',
          location: '',
          summary: '',
          targetRoleTitle: req.user.targetRoleTitle || 'Software Developer',
          skills: [],
          education: [],
          projects: [],
          certifications: [],
          isLocked: false
        }
      });
    }

    res.status(200).json({
      success: true,
      hasProfile: true,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update CV Profile (Manual review & edit before locking)
// @route   PUT /api/cv/profile
// @access  Private
exports.updateCVProfile = async (req, res, next) => {
  try {
    const existing = await DataStore.getCVProfileByUserId(req.user._id);

    if (existing && existing.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'Your CV profile is currently locked. Please unlock it to make edits.'
      });
    }

    const {
      fullName,
      email,
      phone,
      location,
      summary,
      targetRoleTitle,
      skills,
      education,
      projects,
      certifications
    } = req.body;

    const updatedProfile = await DataStore.saveOrUpdateCVProfile(req.user._id, {
      fullName: fullName || req.user.name,
      email: email || req.user.email,
      phone: phone || '',
      location: location || '',
      summary: summary || '',
      targetRoleTitle: targetRoleTitle || existing?.targetRoleTitle || req.user.targetRoleTitle || 'Software Developer',
      skills: skills || [],
      education: education || [],
      projects: projects || [],
      certifications: certifications || []
    });

    // Update user target role if updated in profile
    if (targetRoleTitle) {
      await DataStore.updateUser(req.user._id, { targetRoleTitle });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedProfile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lock CV Profile (finalize verified state)
// @route   POST /api/cv/lock
// @access  Private
exports.lockCVProfile = async (req, res, next) => {
  try {
    const profile = await DataStore.getCVProfileByUserId(req.user._id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please upload a CV first.'
      });
    }

    const updated = await DataStore.saveOrUpdateCVProfile(req.user._id, {
      isLocked: true,
      lockedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'CV Profile locked successfully. Readiness score and gap analysis are now finalized.',
      profile: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unlock CV Profile
// @route   POST /api/cv/unlock
// @access  Private
exports.unlockCVProfile = async (req, res, next) => {
  try {
    const updated = await DataStore.saveOrUpdateCVProfile(req.user._id, {
      isLocked: false,
      lockedAt: null
    });

    res.status(200).json({
      success: true,
      message: 'CV Profile unlocked. You may now make adjustments.',
      profile: updated
    });
  } catch (err) {
    next(err);
  }
};
