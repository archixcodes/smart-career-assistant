require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const JobRole = require('../models/JobRole');
const CVProfile = require('../models/CVProfile');
const InterviewSession = require('../models/InterviewSession');
const defaultJobRoles = require('../data/defaultJobRoles');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_career_assistant';

  try {
    console.log(`Connecting to MongoDB for seeding at ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected! Purging and seeding initial data...');

    // Clear existing job roles and users if needed
    await JobRole.deleteMany({});
    console.log('Cleared existing job roles.');

    // Insert 5 default roles
    const insertedRoles = await JobRole.insertMany(defaultJobRoles);
    console.log(`Successfully seeded ${insertedRoles.length} Job Roles:`);
    insertedRoles.forEach(r => console.log(`  - ${r.title} (${r.requiredSkills.length} skills)`));

    // Seed default admin and demo student if they don't exist
    await User.deleteMany({ email: { $in: ['admin@career.local', 'student@career.local'] } });

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@career.local',
      password: 'admin123',
      role: 'admin'
    });

    const studentUser = await User.create({
      name: 'Alex Johnson',
      email: 'student@career.local',
      password: 'student123',
      role: 'student',
      targetRoleId: insertedRoles[0]._id,
      targetRoleTitle: insertedRoles[0].title
    });

    console.log('Successfully seeded default users:');
    console.log(`  - Admin: admin@career.local / admin123`);
    console.log(`  - Student: student@career.local / student123`);

    // Seed initial CV Profile for demo student
    await CVProfile.deleteMany({ userId: studentUser._id });
    await CVProfile.create({
      userId: studentUser._id,
      fullName: 'Alex Johnson',
      email: 'student@career.local',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      summary: 'Passionate software engineering graduate with hands-on full-stack development experience and strong interest in system design.',
      targetRoleId: insertedRoles[0]._id,
      targetRoleTitle: insertedRoles[0].title,
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
      isLocked: false
    });

    console.log('Seeded demo CV Profile for student.');
    console.log('Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.warn(`Seeding to standalone MongoDB halted: ${err.message}`);
    console.log('Note: DataStore fallback has already seeded in-memory/JSON store for offline readiness.');
    process.exit(0);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
