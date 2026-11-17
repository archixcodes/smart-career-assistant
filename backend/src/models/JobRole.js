const mongoose = require('mongoose');

const skillRequirementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  minimumProficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  weight: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  description: {
    type: String,
    default: ''
  }
});

const roadmapStepSchema = new mongoose.Schema({
  step: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '3-4 weeks'
  },
  topics: [{
    type: String
  }]
});

const jobRoleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    category: {
      type: String,
      default: 'Engineering'
    },
    requiredSkills: [skillRequirementSchema],
    roadmap: [roadmapStepSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('JobRole', jobRoleSchema);
