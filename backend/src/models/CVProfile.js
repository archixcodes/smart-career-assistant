const mongoose = require('mongoose');

const skillItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  yearsOfExperience: {
    type: Number,
    default: 1
  },
  source: {
    type: String,
    enum: ['extracted', 'manual'],
    default: 'extracted'
  }
});

const educationItemSchema = new mongoose.Schema({
  institution: {
    type: String,
    default: ''
  },
  degree: {
    type: String,
    default: ''
  },
  fieldOfStudy: {
    type: String,
    default: ''
  },
  graduationYear: {
    type: String,
    default: ''
  },
  gpa: {
    type: String,
    default: ''
  }
});

const projectItemSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  technologies: [{
    type: String
  }],
  link: {
    type: String,
    default: ''
  }
});

const certificationItemSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  issuingOrganization: {
    type: String,
    default: ''
  },
  issueDate: {
    type: String,
    default: ''
  },
  credentialId: {
    type: String,
    default: ''
  }
});

const cvProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    summary: {
      type: String,
      default: ''
    },
    targetRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRole',
      default: null
    },
    targetRoleTitle: {
      type: String,
      default: ''
    },
    skills: [skillItemSchema],
    education: [educationItemSchema],
    projects: [projectItemSchema],
    certifications: [certificationItemSchema],
    originalFileName: {
      type: String,
      default: ''
    },
    fileUrl: {
      type: String,
      default: ''
    },
    rawParsedText: {
      type: String,
      default: ''
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    lockedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CVProfile', cvProfileSchema);
