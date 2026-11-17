/**
 * Resilient Data Access Layer
 * Seamlessly uses Mongoose when MongoDB is connected, or falls back to
 * a fast, persistent JSON/in-memory store when MongoDB daemon is not detected.
 */

const fs = require('fs');
const path = require('path');
const { getDBStatus } = require('./db');
const UserMongoose = require('../models/User');
const JobRoleMongoose = require('../models/JobRole');
const CVProfileMongoose = require('../models/CVProfile');
const InterviewSessionMongoose = require('../models/InterviewSession');
const defaultJobRoles = require('../data/defaultJobRoles');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../../data_store.json');

// In-memory memory structures
let memoryStore = {
  users: [],
  jobRoles: [],
  cvProfiles: [],
  interviewSessions: []
};

// Load existing JSON store if available
function loadFileStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      memoryStore = JSON.parse(data);
    }
  } catch (err) {
    console.warn('[DataStore] Warning reading local fallback store:', err.message);
  }
}

function persistStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DataStore] Warning writing local fallback store:', err.message);
  }
}

loadFileStore();

function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Seed default roles and admin/student in fallback store if empty
async function seedFallbackStore() {
  if (!memoryStore.jobRoles || memoryStore.jobRoles.length === 0) {
    memoryStore.jobRoles = defaultJobRoles.map((role, idx) => ({
      _id: `role_${idx + 1}`,
      ...role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  if (!memoryStore.users || memoryStore.users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    const studentHash = await bcrypt.hash('student123', salt);

    memoryStore.users = [
      {
        _id: 'user_admin_1',
        name: 'System Admin',
        email: 'admin@career.local',
        password: hash,
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'user_student_1',
        name: 'Alex Johnson',
        email: 'student@career.local',
        password: studentHash,
        role: 'student',
        targetRoleTitle: 'Software Developer',
        createdAt: new Date().toISOString()
      }
    ];

    // Seed initial CV profile for Alex
    memoryStore.cvProfiles = [
      {
        _id: 'cv_student_1',
        userId: 'user_student_1',
        fullName: 'Alex Johnson',
        email: 'student@career.local',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        summary: 'Enthusiastic software engineering graduate skilled in full-stack web and backend architecture.',
        targetRoleTitle: 'Software Developer',
        skills: [
          { name: 'JavaScript', proficiency: 'Advanced', yearsOfExperience: 3, source: 'extracted' },
          { name: 'React.js', proficiency: 'Advanced', yearsOfExperience: 2, source: 'extracted' },
          { name: 'Node.js', proficiency: 'Intermediate', yearsOfExperience: 2, source: 'extracted' },
          { name: 'Data Structures & Algorithms', proficiency: 'Intermediate', yearsOfExperience: 1, source: 'extracted' },
          { name: 'Git & Version Control', proficiency: 'Intermediate', yearsOfExperience: 2, source: 'extracted' },
          { name: 'RESTful API Design', proficiency: 'Intermediate', yearsOfExperience: 2, source: 'extracted' }
        ],
        education: [
          { institution: 'State University of Technology', degree: 'Bachelor of Science', fieldOfStudy: 'Computer Science', graduationYear: '2024', gpa: '3.8' }
        ],
        projects: [
          { title: 'Cloud Task Orchestrator', description: 'Real-time task scheduling platform with React & Express.', technologies: ['React', 'Node.js', 'MongoDB'], link: 'https://github.com/example/task-orchestrator' }
        ],
        certifications: [
          { name: 'AWS Certified Cloud Practitioner', issuingOrganization: 'Amazon Web Services', issueDate: '2024' }
        ],
        isLocked: false,
        createdAt: new Date().toISOString()
      }
    ];

    persistStore();
  }
}

seedFallbackStore();

// Universal Data Adapter
const DataStore = {
  // USER OPERATIONS
  async findUserByEmail(email) {
    if (getDBStatus().isConnected) {
      return await UserMongoose.findOne({ email: email.toLowerCase() });
    }
    const found = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return null;
    return {
      ...found,
      matchPassword: async (pwd) => await bcrypt.compare(pwd, found.password)
    };
  },

  async findUserById(id) {
    if (getDBStatus().isConnected) {
      return await UserMongoose.findById(id).select('-password');
    }
    const found = memoryStore.users.find(u => u._id === id);
    if (!found) return null;
    const { password, ...safeUser } = found;
    return safeUser;
  },

  async createUser({ name, email, password, role, targetRoleTitle, targetRoleId }) {
    if (getDBStatus().isConnected) {
      return await UserMongoose.create({ name, email, password, role, targetRoleTitle, targetRoleId });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      targetRoleTitle: targetRoleTitle || '',
      targetRoleId: targetRoleId || null,
      createdAt: new Date().toISOString()
    };
    memoryStore.users.push(newUser);
    persistStore();
    return newUser;
  },

  async updateUser(id, updates) {
    if (getDBStatus().isConnected) {
      return await UserMongoose.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    }
    const idx = memoryStore.users.findIndex(u => u._id === id);
    if (idx !== -1) {
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates, updatedAt: new Date().toISOString() };
      persistStore();
      const { password, ...safeUser } = memoryStore.users[idx];
      return safeUser;
    }
    return null;
  },

  // JOB ROLES OPERATIONS
  async getAllJobRoles() {
    if (getDBStatus().isConnected) {
      return await JobRoleMongoose.find({ isActive: true });
    }
    return memoryStore.jobRoles.filter(r => r.isActive !== false);
  },

  async getJobRoleById(id) {
    if (getDBStatus().isConnected) {
      return await JobRoleMongoose.findById(id);
    }
    return memoryStore.jobRoles.find(r => r._id === id || r.code === id || r.title.toLowerCase() === id.toLowerCase());
  },

  async getJobRoleByTitleOrCode(query) {
    if (getDBStatus().isConnected) {
      return await JobRoleMongoose.findOne({
        $or: [
          { code: query.toLowerCase() },
          { title: new RegExp(`^${query}$`, 'i') }
        ]
      });
    }
    return memoryStore.jobRoles.find(r =>
      r.code.toLowerCase() === query.toLowerCase() ||
      r.title.toLowerCase() === query.toLowerCase()
    );
  },

  async createJobRole(roleData) {
    if (getDBStatus().isConnected) {
      return await JobRoleMongoose.create(roleData);
    }
    const newRole = {
      _id: generateId(),
      ...roleData,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    memoryStore.jobRoles.push(newRole);
    persistStore();
    return newRole;
  },

  async updateJobRole(id, roleData) {
    if (getDBStatus().isConnected) {
      return await JobRoleMongoose.findByIdAndUpdate(id, roleData, { new: true });
    }
    const idx = memoryStore.jobRoles.findIndex(r => r._id === id);
    if (idx !== -1) {
      memoryStore.jobRoles[idx] = { ...memoryStore.jobRoles[idx], ...roleData, updatedAt: new Date().toISOString() };
      persistStore();
      return memoryStore.jobRoles[idx];
    }
    return null;
  },

  async deleteJobRole(id) {
    if (getDBStatus().isConnected) {
      return await JobRoleMongoose.findByIdAndUpdate(id, { isActive: false });
    }
    const idx = memoryStore.jobRoles.findIndex(r => r._id === id);
    if (idx !== -1) {
      memoryStore.jobRoles[idx].isActive = false;
      persistStore();
      return true;
    }
    return false;
  },

  // CV PROFILE OPERATIONS
  async getCVProfileByUserId(userId) {
    if (getDBStatus().isConnected) {
      return await CVProfileMongoose.findOne({ userId });
    }
    return memoryStore.cvProfiles.find(p => p.userId === userId || p.userId === userId.toString());
  },

  async saveOrUpdateCVProfile(userId, profileData) {
    if (getDBStatus().isConnected) {
      return await CVProfileMongoose.findOneAndUpdate(
        { userId },
        { ...profileData, userId },
        { new: true, upsert: true }
      );
    }
    const idx = memoryStore.cvProfiles.findIndex(p => p.userId === userId || p.userId === userId.toString());
    if (idx !== -1) {
      memoryStore.cvProfiles[idx] = {
        ...memoryStore.cvProfiles[idx],
        ...profileData,
        userId,
        updatedAt: new Date().toISOString()
      };
      persistStore();
      return memoryStore.cvProfiles[idx];
    } else {
      const newProfile = {
        _id: generateId(),
        userId,
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryStore.cvProfiles.push(newProfile);
      persistStore();
      return newProfile;
    }
  },

  // INTERVIEW SESSIONS OPERATIONS
  async createInterviewSession(sessionData) {
    if (getDBStatus().isConnected) {
      return await InterviewSessionMongoose.create(sessionData);
    }
    const newSession = {
      _id: generateId(),
      ...sessionData,
      status: 'in_progress',
      currentQuestionIndex: 0,
      createdAt: new Date().toISOString()
    };
    memoryStore.interviewSessions.push(newSession);
    persistStore();
    return newSession;
  },

  async getInterviewSessionById(id) {
    if (getDBStatus().isConnected) {
      return await InterviewSessionMongoose.findById(id);
    }
    return memoryStore.interviewSessions.find(s => s._id === id);
  },

  async updateInterviewSession(id, updates) {
    if (getDBStatus().isConnected) {
      return await InterviewSessionMongoose.findByIdAndUpdate(id, updates, { new: true });
    }
    const idx = memoryStore.interviewSessions.findIndex(s => s._id === id);
    if (idx !== -1) {
      memoryStore.interviewSessions[idx] = {
        ...memoryStore.interviewSessions[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      persistStore();
      return memoryStore.interviewSessions[idx];
    }
    return null;
  },

  async getInterviewSessionsByUserId(userId) {
    if (getDBStatus().isConnected) {
      return await InterviewSessionMongoose.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryStore.interviewSessions
      .filter(s => s.userId === userId || s.userId === userId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getAllInterviewSessions() {
    if (getDBStatus().isConnected) {
      return await InterviewSessionMongoose.find().populate('userId', 'name email').sort({ createdAt: -1 });
    }
    return memoryStore.interviewSessions.map(s => {
      const u = memoryStore.users.find(user => user._id === s.userId);
      return {
        ...s,
        user: u ? { name: u.name, email: u.email } : null
      };
    });
  }
};

module.exports = DataStore;
