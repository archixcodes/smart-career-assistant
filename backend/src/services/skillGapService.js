/**
 * Skill Gap Analysis & Placement Readiness Score Engine
 * Meets FR-2-01 to FR-2-06 requirements.
 */

const PROFICIENCY_RANKS = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4
};

// Aliases for intelligent skill normalization
const SKILL_ALIASES = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'react': 'react.js',
  'reactjs': 'react.js',
  'node': 'node.js',
  'nodejs': 'node.js',
  'express': 'express.js',
  'expressjs': 'express.js',
  'next': 'next.js',
  'nextjs': 'next.js',
  'vue': 'vue.js',
  'vuejs': 'vue.js',
  'postgres': 'postgresql',
  'mongo': 'mongodb',
  'oop': 'object-oriented programming (oop)',
  'dsa': 'data structures & algorithms',
  'algorithms': 'data structures & algorithms',
  'data structures': 'data structures & algorithms',
  'rest': 'restful api design',
  'rest api': 'restful api design',
  'rest apis': 'restful api design',
  'restful apis': 'restful api design',
  'system design': 'system design basics',
  'git': 'git & version control',
  'version control': 'git & version control',
  'github': 'git & version control',
  'docker': 'docker / containerization',
  'containerization': 'docker / containerization',
  'sql': 'sql & advanced querying',
  'power bi': 'data visualization (tableau / power bi / matplotlib)',
  'tableau': 'data visualization (tableau / power bi / matplotlib)',
  'statistics': 'applied statistics & probability',
  'spring': 'spring boot & spring framework',
  'spring boot': 'spring boot & spring framework',
  'jpa': 'spring data jpa / hibernate',
  'hibernate': 'spring data jpa / hibernate'
};

function normalizeSkill(str) {
  if (!str) return '';
  const cleaned = str.toLowerCase().replace(/[^a-z0-9+#]/g, ' ').trim().replace(/\s+/g, ' ');
  return SKILL_ALIASES[cleaned] || cleaned;
}

/**
 * Compares candidate profile against required job role skill matrix
 */
function analyzeSkillGap(candidateProfile, jobRole) {
  if (!jobRole || !jobRole.requiredSkills || jobRole.requiredSkills.length === 0) {
    return {
      matchedSkills: [],
      missingSkills: [],
      weakSkills: [],
      skillGapPercentage: 0,
      readinessScore: 50,
      breakdown: {},
      roadmap: [],
      recommendations: []
    };
  }

  const userSkillsMap = new Map();
  (candidateProfile?.skills || []).forEach(s => {
    const norm = normalizeSkill(s.name);
    const profRank = PROFICIENCY_RANKS[(s.proficiency || 'intermediate').toLowerCase()] || 2;
    userSkillsMap.set(norm, {
      rawName: s.name,
      proficiency: s.proficiency || 'Intermediate',
      rank: profRank,
      yearsOfExperience: s.yearsOfExperience || 1
    });
  });

  const matchedSkills = [];
  const weakSkills = [];
  const missingSkills = [];

  let totalWeight = 0;
  let earnedWeight = 0;

  jobRole.requiredSkills.forEach(req => {
    const weight = req.weight || 4;
    totalWeight += weight;

    const reqNorm = normalizeSkill(req.name);
    const reqMinRank = PROFICIENCY_RANKS[(req.minimumProficiency || 'intermediate').toLowerCase()] || 2;

    // Check direct or partial match
    let userMatch = null;
    for (const [uNorm, uData] of userSkillsMap.entries()) {
      if (uNorm === reqNorm || uNorm.includes(reqNorm) || reqNorm.includes(uNorm)) {
        userMatch = uData;
        break;
      }
    }

    if (!userMatch) {
      missingSkills.push({
        name: req.name,
        category: req.category,
        minimumProficiency: req.minimumProficiency,
        weight: req.weight,
        description: req.description,
        status: 'missing'
      });
    } else if (userMatch.rank >= reqMinRank) {
      matchedSkills.push({
        name: req.name,
        candidateProficiency: userMatch.proficiency,
        minimumProficiency: req.minimumProficiency,
        category: req.category,
        weight: req.weight,
        description: req.description,
        status: 'matched'
      });
      earnedWeight += weight;
    } else {
      // Present but lower proficiency than required
      weakSkills.push({
        name: req.name,
        candidateProficiency: userMatch.proficiency,
        minimumProficiency: req.minimumProficiency,
        category: req.category,
        weight: req.weight,
        description: req.description,
        rankGap: reqMinRank - userMatch.rank,
        status: 'weak'
      });
      // Partial credit for weak skill
      earnedWeight += weight * (userMatch.rank / reqMinRank);
    }
  });

  const totalReq = jobRole.requiredSkills.length;
  const missingCount = missingSkills.length;
  const weakCount = weakSkills.length;

  // Metric 1: Skill Gap Percentage
  // Formula: ((Missing + 0.5 * Weak) / Total) * 100
  const rawGap = totalReq > 0 ? ((missingCount + (weakCount * 0.5)) / totalReq) * 100 : 0;
  const skillGapPercentage = Math.min(100, Math.max(0, Math.round(rawGap)));

  // Metric 2: Placement Readiness Score (0 - 100)
  // 70% Skill Matrix Fit + 15% Project Depth + 15% Certifications/Profile Completeness
  const skillScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 70 : 35;

  const projectCount = (candidateProfile?.projects || []).length;
  const projectScore = Math.min(15, projectCount * 5); // up to 3 projects for max 15 pts

  const certCount = (candidateProfile?.certifications || []).length;
  const eduCount = (candidateProfile?.education || []).length;
  const profileScore = Math.min(15, (certCount * 5) + (eduCount * 5));

  const totalReadiness = Math.round(skillScore + projectScore + profileScore);
  const readinessScore = Math.min(100, Math.max(10, totalReadiness));

  // Determine Readiness Badge / Status
  let readinessTier = 'Developing';
  if (readinessScore >= 85) readinessTier = 'Interview Ready (Elite)';
  else if (readinessScore >= 70) readinessTier = 'High Competence';
  else if (readinessScore >= 50) readinessTier = 'Moderate Readiness';
  else readinessTier = 'Requires Foundational Upskilling';

  // Generate Personalized Recommendations based on Gaps
  const recommendations = [];
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3).map(s => s.name).join(', ');
    recommendations.push({
      type: 'high_priority',
      title: 'Address Critical Skill Gaps',
      description: `Target top missing core requirements: ${topMissing}. Build hands-on mini projects to prove practical competence.`
    });
  }
  if (weakSkills.length > 0) {
    const topWeak = weakSkills.slice(0, 2).map(s => s.name).join(', ');
    recommendations.push({
      type: 'medium_priority',
      title: 'Elevate Proficiency in Weak Areas',
      description: `Deepen your knowledge of ${topWeak} to meet the required ${jobRole.title} benchmark.`
    });
  }
  recommendations.push({
    type: 'action_step',
    title: 'Simulate Adaptive Mock Interviews',
    description: `Complete an AI Mock Interview in '${jobRole.title}' to test conceptual depth under realistic interview pressure.`
  });

  // Tailored Roadmap tailored to candidate gaps
  const customRoadmap = (jobRole.roadmap || []).map(r => {
    // Check if any topics relate to candidate's missing/weak skills
    const hasGaps = r.topics.some(topic =>
      missingSkills.some(m => topic.toLowerCase().includes(m.name.toLowerCase())) ||
      weakSkills.some(w => topic.toLowerCase().includes(w.name.toLowerCase()))
    );
    return {
      ...r,
      isPriority: hasGaps,
      status: hasGaps ? 'needs_focus' : 'on_track'
    };
  });

  return {
    jobRoleTitle: jobRole.title,
    totalRequiredSkills: totalReq,
    matchedSkills,
    missingSkills,
    weakSkills,
    skillGapPercentage,
    readinessScore,
    readinessTier,
    breakdown: {
      skillScore: Math.round(skillScore),
      projectScore,
      profileScore,
      matchedCount: matchedSkills.length,
      weakCount,
      missingCount
    },
    recommendations,
    roadmap: customRoadmap
  };
}

module.exports = {
  analyzeSkillGap,
  normalizeSkill,
  PROFICIENCY_RANKS
};
