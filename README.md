# 🚀 Smart Career Assistant (Version 1.0)

> **Production-Ready Full-Stack AI Platform combining CV Parsing, Skill-Gap Analysis, Job Readiness Scoring, Career Roadmaps, and Adaptive Mock Interviews.**

[![Full-Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20Express%20%7C%20Vite-blue)](https://github.com)
[![Version](https://img.shields.io/badge/Release-v1.0.0-emerald)](https://github.com)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com)

---

## 📋 Executive Overview

**Smart Career Assistant** is a full-stack, enterprise-grade application built to bridge the gap between academic preparation and industry placement readiness. Students upload their PDF resumes to auto-extract qualifications, benchmark their competencies against curated job role skill matrices, simulate adaptive AI mock interviews with dynamic difficulty scaling, and review actionable learning roadmaps.

---

## 🏗️ Architecture & Monorepo Structure

```
smart-career-assistant/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, DataStore adapter, Seeders
│   │   │   ├── db.js           # Mongoose MongoDB connector with fast fallback
│   │   │   ├── dataStore.js    # Resilient data layer (Mongoose / JSON persistence)
│   │   │   └── seed.js         # Automated database seeding script
│   │   ├── controllers/        # REST route controllers
│   │   │   ├── authController.js       # Register, Login, Target Role updates
│   │   │   ├── cvController.js         # PDF upload, profile review & lock
│   │   │   ├── skillGapController.js   # Gap calculation & simulator
│   │   │   ├── interviewController.js  # Adaptive interview flow & history
│   │   │   └── adminController.js      # Job role & skill matrix CRUD
│   │   ├── data/
│   │   │   └── defaultJobRoles.js      # Initial 5 job matrices & roadmaps
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification middleware
│   │   │   ├── role.js         # Role-based access control (Student / Admin)
│   │   │   ├── upload.js       # Multer PDF file filter and storage
│   │   │   └── errorHandler.js # Centralized error & exception handling
│   │   ├── models/             # Mongoose Schemas & Models
│   │   │   ├── User.js
│   │   │   ├── JobRole.js
│   │   │   ├── CVProfile.js
│   │   │   └── InterviewSession.js
│   │   ├── routes/             # Express API route modules
│   │   ├── services/
│   │   │   ├── pdfParserService.js     # Heuristic and taxonomy PDF extractor
│   │   │   ├── llmService.js           # OpenAI / Gemini / Intelligent Fallback
│   │   │   ├── skillGapService.js      # Mathematical gap & readiness engine
│   │   │   └── interviewEngine.js      # Adaptive question & difficulty state machine
│   │   └── server.js           # Express app entry point
│   ├── uploads/                # Resume document storage
│   ├── sample_resumes/         # Pre-configured test PDFs (e.g. Alex Johnson)
│   ├── test-controllers.js     # Automated business logic test suite
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI widgets
│   │   │   ├── Navbar.jsx              # Navigation with target role selector pill
│   │   │   ├── Footer.jsx              # Platform credentials & status
│   │   │   ├── StatCard.jsx            # Interactive KPI cards
│   │   │   ├── SkillBadge.jsx          # Matched, Weak & Missing skill badges
│   │   │   ├── ReadinessGauge.jsx      # Radial SVG progress gauge
│   │   │   ├── RoadmapView.jsx         # Step-by-step career path roadmap
│   │   │   ├── AudioWave.jsx           # Real-time audio waveform visualizer
│   │   │   └── LoadingSpinner.jsx      # Async state indicators
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Authentication & Quick Demo access
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Auth + 1-click student/admin demo logins
│   │   │   ├── Register.jsx            # Account creation with role & target selection
│   │   │   ├── Dashboard.jsx           # Placement readiness command center
│   │   │   ├── CVProfilePage.jsx       # PDF upload, field review & lock switch
│   │   │   ├── SkillGapPage.jsx        # Comparative matrix & role simulator
│   │   │   ├── InterviewSetupPage.jsx  # Mode & difficulty selection
│   │   │   ├── InterviewSessionPage.jsx# Conversational screen (Speech-to-text / Text-to-speech)
│   │   │   ├── InterviewSummaryPage.jsx# Wrap-up scorecard, confetti & weak topics
│   │   │   ├── InterviewHistoryPage.jsx# Session history & logs
│   │   │   └── AdminDashboardPage.jsx  # Job role and skill matrix CRUD
│   │   ├── services/           # Axios API services
│   │   ├── App.jsx             # React Router v6 routing & guards
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind CSS directives
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── shared/
│   └── constants.js            # Shared taxonomies, roles, and thresholds
└── package.json                # Root monorepo script orchestrator
```

---

## ⚡ Core Features & Requirements Implementation

### 1. Authentication & User Profile (Module 1)
- **Role-Based Access Control (RBAC)**: Secure registration and login for **Student** and **Administrator** privileges using salted bcrypt hashing and JWT tokens.
- **CV Upload & Parsing (FR-1-03 to FR-1-05)**: Upload resumes in PDF format using Multer. Automatically extracts Name, Education, Skills, Projects, and Certifications using `pdf-parse` and LLM taxonomy matching.
- **Profile Review & Lock**: Extracted information is presented in an editable UI form with individual skill proficiency ratings (Beginner, Intermediate, Advanced, Expert). Candidates review, edit, and then lock their profile.
- **Target Role Selector (FR-1-06)**: Candidate selects 1 primary role from the initial v1.0 scope:
  1. `Software Developer`
  2. `Python Developer`
  3. `Data Analyst`
  4. `Web Developer`
  5. `Java Developer`

### 2. Skill Gap Analyzer & Readiness Score (Module 2)
- **Comparison Engine (FR-2-01 to FR-2-04)**: Analyzes user skills against required matrix for the target role:
  - 🟢 **Matched Skills**: Present on CV with proficiency $\ge$ required minimum.
  - 🟡 **Weak Skills**: Present on CV but proficiency is below required benchmark.
  - 🔴 **Missing Skills**: Required by the target role but absent from profile.
- **Skill Gap Percentage (FR-2-05)**:
  $$\text{Skill Gap } \% = \frac{\text{Missing Count} + 0.5 \times \text{Weak Count}}{\text{Total Required Skills}} \times 100\%$$
- **Placement Readiness Score (FR-2-06)**:
  Composite 0–100% score weighting 70% Skill Matrix Fit + 15% Project Relevance + 15% Profile Completeness.
- **Interactive Role Simulator**: Instant on-the-fly benchmark comparison against any of the 5 roles.
- **Tailored Roadmap**: Dynamic milestones prioritizing topics that target identified gaps.

### 3. AI Mock Interview & Adaptive Question Flow (Module 3)
- **Modes (FR-3-01)**:
  - `Technical Round`: Code mechanics, data structures, and architectural questions.
  - `HR & Behavioral`: Culture, leadership, and STAR conflict resolution.
  - `CV-Based`: Scrutinizes projects and experience claims directly from candidate's CV.
  - `Mixed Round`: Comprehensive multi-stage simulation.
- **Speech Interaction**:
  - **Speech-to-Text**: Dictate answers using Web Speech API with live pulsating audio waveform visualizer.
  - **Text-to-Speech**: Listen to questions spoken aloud by the AI interviewer.
- **Real-Time Adaptive Difficulty Flow (FR-3-05)**:
  - $\text{Score} \ge 80\% \implies$ **Escalate Difficulty** (e.g. Easy $\to$ Medium $\to$ Hard).
  - $60\% \le \text{Score} \le 79\% \implies$ **Maintain Difficulty**.
  - $\text{Score} < 60\% \implies$ **Decrease Difficulty** to foundational concepts.
- **Instant Actionable Feedback**: Displays instant score (0–100%), strengths, areas for improvement, and ideal answer keys.

### 4. Session Wrap-up & Evaluation (Module 4)
- **Comprehensive Scorecard (FR-4-01)**: Technical Score, HR Score, and Overall Average with tier badges (*Job Ready*, *Exceptional*, *Developing*).
- **Celebration Feedback**: Confetti animation triggers when score $\ge 75\%$.
- **Weak Topics Flagged (FR-4-02)**: Highlights concepts with scores below 70% for targeted review.
- **Personalized Suggestions (FR-4-03)**: Actionable study tips tailored to weaknesses.
- **Complete Transcript Review (FR-4-04)**: Expandable question-by-question review of questions, candidate answers, and model answers.
- **Historical Session Log (FR-4-05)**: Complete past interview log with performance trends.

### 5. Administration Controls (Module 5)
- **Job Roles CRUD (FR-5-01, FR-5-02)**: Add, edit, or deactivate job roles.
- **Skill Matrix Management**: Add or remove required skills, set categories, configure minimum expected proficiency, and adjust weights (1–5).
- **Platform Analytics**: Aggregate metrics on total roles, total interviews, and average scores.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** or **pnpm**
- *(Optional)* **MongoDB** (A built-in data persistence fallback activates automatically if MongoDB is not running, ensuring 100% out-of-the-box readiness).
- *(Optional)* **OpenAI API Key** or **Gemini API Key** (A built-in intelligent contextual engine activates automatically if external keys are not provided).

### 1. Installation
Clone or navigate to the project directory:
```bash
cd smart-career-assistant
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configuration (.env)
The backend `.env` file is pre-configured with safe defaults in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/smart_career_assistant
JWT_SECRET=super_secret_smart_career_jwt_token_key_2026
JWT_EXPIRES_IN=7d

# Optional External AI API Keys
OPENAI_API_KEY=
GEMINI_API_KEY=
```

### 3. Run Development Servers
From the root directory, start both the backend and frontend concurrently:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 🔑 One-Click Instant Demo Credentials

The login screen provides **1-Click Instant Demo Buttons** to effortlessly sign in as either:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Student** | `student@career.local` | `student123` | CV Upload, Skill Gap, Mock Interview, History |
| **Administrator** | `admin@career.local` | `admin123` | Module 5 Admin Dashboard, Job Matrix CRUD |

*(Or click "Create an account" to register your own custom user!)*

---

## 🧪 Testing & Verification

Run the automated integration test suite:
```bash
cd backend
node test-controllers.js
```
Expected output:
```
--- STARTING IN-MEMORY CONTROLLER & SERVICES TEST SUITE ---
1. Student login: 200 ✓ PASS
2. Fetch CV Profile: 200 ✓ PASS
3. Update target role: 200 ✓ PASS
4. Skill Gap Analysis: 200 Readiness Score: 36% Skill Gap: 72% ✓ PASS
   Matched skills: 2, Missing: 6, Weak: 1
5. Start Interview Session: 201 ✓ PASS
6. Answer Evaluation: 200 Score: 75% Next Difficulty: medium ✓ PASS
7. Admin Stats: 200 Total Roles: 5 ✓ PASS
--- ALL CONTROLLER & SERVICES TESTS PASSED SUCCESSFULLY! ---
```

To test PDF resume extraction on a real document:
```bash
node -e "const { extractTextFromPDF, parseResumeText } = require('./src/services/pdfParserService.js'); (async () => { const text = await extractTextFromPDF('../sample_resumes/Alex_Johnson_Resume.pdf'); console.log(parseResumeText(text)); })()"
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Student or Admin account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Protected | Get current user session & profile status |
| `PUT` | `/api/auth/target-role` | Protected | Update student's target job role (FR-1-06) |
| `POST` | `/api/cv/upload` | Protected | Upload & parse PDF resume (FR-1-03) |
| `GET` | `/api/cv/profile` | Protected | Get parsed resume details |
| `PUT` | `/api/cv/profile` | Protected | Save manual adjustments before locking (FR-1-04) |
| `POST` | `/api/cv/lock` | Protected | Lock & verify CV profile (FR-1-05) |
| `POST` | `/api/cv/unlock` | Protected | Unlock CV profile for updates |
| `GET` | `/api/gap-analysis` | Protected | Compute Skill Gap & Readiness Score (FR-2-01 to FR-2-06) |
| `GET` | `/api/gap-analysis/roles`| Public | Fetch available role matrices |
| `POST` | `/api/gap-analysis/simulate`| Protected | Simulate gap for alternative target role |
| `POST` | `/api/interview/start` | Protected | Initialize adaptive interview session (FR-3-01) |
| `GET` | `/api/interview/:id` | Protected | Get session state & progress |
| `GET` | `/api/interview/:id/next-question` | Protected | Get next dynamic question (FR-3-02) |
| `POST` | `/api/interview/:id/answer` | Protected | Submit answer, score, & adapt difficulty (FR-3-03 to FR-3-05) |
| `POST` | `/api/interview/:id/finish` | Protected | Compile final evaluation scorecard (FR-4-01) |
| `GET` | `/api/interview/history` | Protected | Fetch past interview logs (FR-4-05) |
| `GET` | `/api/admin/roles` | Admin | Get all job roles & matrices (FR-5-01) |
| `POST` | `/api/admin/roles` | Admin | Create new job role |
| `PUT` | `/api/admin/roles/:id` | Admin | Update job role & skill matrix (FR-5-02) |
| `DELETE` | `/api/admin/roles/:id` | Admin | Deactivate job role |
| `GET` | `/api/admin/stats` | Admin | Platform metrics & interview analytics |

---

## 🛡️ License
ISC © 2026 Smart Career Assistant Engineering Team.
