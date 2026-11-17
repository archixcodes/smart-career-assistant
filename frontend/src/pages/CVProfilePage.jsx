import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { cvService } from '../services/cvService';
import { skillGapService } from '../services/skillGapService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  UploadCloud,
  FileText,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const TARGET_ROLES = [
  'Software Developer',
  'Python Developer',
  'Data Analyst',
  'Web Developer',
  'Java Developer'
];

const PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function CVProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [targetRoleTitle, setTargetRoleTitle] = useState('Software Developer');
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [originalFileName, setOriginalFileName] = useState('');

  // Active section tab
  const [activeTab, setActiveTab] = useState('skills');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await cvService.getProfile();
      if (res.success && res.profile) {
        populateForm(res.profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (p) => {
    setFullName(p.fullName || user?.name || '');
    setEmail(p.email || user?.email || '');
    setPhone(p.phone || '');
    setLocation(p.location || '');
    setSummary(p.summary || '');
    setTargetRoleTitle(p.targetRoleTitle || user?.targetRoleTitle || 'Software Developer');
    setSkills(p.skills || []);
    setEducation(p.education || []);
    setProjects(p.projects || []);
    setCertifications(p.certifications || []);
    setIsLocked(p.isLocked || false);
    setOriginalFileName(p.originalFileName || '');
  };

  // Handle PDF Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('cvFile', file);

    try {
      const res = await cvService.uploadCV(formData);
      if (res.success && res.profile) {
        populateForm(res.profile);
        setMessage('CV successfully uploaded & parsed! Review the extracted fields below.');
        await refreshUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'CV upload and extraction failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
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
      };

      const res = await cvService.updateProfile(payload);
      if (res.success) {
        setMessage('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Lock / Unlock
  const handleToggleLock = async () => {
    setLocking(true);
    setError(null);
    setMessage(null);

    try {
      if (isLocked) {
        const res = await cvService.unlockProfile();
        if (res.success) {
          setIsLocked(false);
          setMessage('Profile unlocked! You can now edit your details.');
        }
      } else {
        // Save first to ensure latest edits are stored
        await handleSaveProfile();
        const res = await cvService.lockProfile();
        if (res.success) {
          setIsLocked(true);
          setMessage('Profile locked & verified! Placement readiness calculations are now secured.');
        }
      }
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lock operation failed.');
    } finally {
      setLocking(false);
    }
  };

  // Skill manipulations
  const addSkill = () => {
    setSkills([...skills, { name: '', proficiency: 'Intermediate', yearsOfExperience: 1, source: 'manual' }]);
  };

  const updateSkill = (index, field, value) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Education manipulations
  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', fieldOfStudy: '', graduationYear: '2024' }]);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Project manipulations
  const addProject = () => {
    setProjects([...projects, { title: '', description: '', technologies: [], link: '' }]);
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Certification manipulations
  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuingOrganization: '', issueDate: '2024' }]);
  };

  const updateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner message="Loading candidate profile & extracted data..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              CV Profile & Extraction Review
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                isLocked
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              <span>{isLocked ? 'Locked & Verified' : 'Draft / Editable'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload your PDF resume to auto-extract qualifications (FR-1-03 to FR-1-05). Review or adjust fields before locking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving || isLocked}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-40 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleLock}
            disabled={locking}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isLocked
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isLocked ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>Unlock to Edit</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Lock & Finalize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Banner: PDF Upload Area + Target Role Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-dashed border-slate-300 hover:border-sky-400 transition-colors shadow-sm flex flex-col items-center justify-center text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
            id="pdf-upload-input"
            disabled={uploading}
          />
          <label
            htmlFor="pdf-upload-input"
            className="cursor-pointer flex flex-col items-center w-full"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {uploading ? 'Extracting & Parsing with AI...' : 'Upload PDF Resume'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Click to select or drag and drop your standard PDF resume. Supports automatic extraction of Education, Skills, Projects, and Certifications.
            </p>
            {originalFileName && (
              <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>Last uploaded: {originalFileName}</span>
              </div>
            )}
          </label>
        </div>

        {/* Target Job Role Selector Card (FR-1-06) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Briefcase className="w-4 h-4 text-sky-600" />
              <span>Target Role Selector (FR-1-06)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select 1 primary career goal from the v1.0 scope to benchmark your skills and interview questions.
            </p>

            <div className="mt-4 space-y-2">
              {TARGET_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTargetRoleTitle(r)}
                  disabled={isLocked}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                    targetRoleTitle === r
                      ? 'bg-sky-50 border-sky-400 text-sky-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{r}</span>
                  {targetRoleTitle === r && (
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4">
            Changing your role adjusts the required skill matrix dynamically.
          </p>
        </div>
      </div>

      {/* Main Extracted Fields Review Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-4 gap-2 overflow-x-auto bg-slate-50/50">
          {[
            { id: 'skills', label: `Skills (${skills.length})`, icon: Code2 },
            { id: 'general', label: 'Basic Info & Summary', icon: FileText },
            { id: 'education', label: `Education (${education.length})`, icon: GraduationCap },
            { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
            { id: 'certifications', label: `Certifications (${certifications.length})`, icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-sky-600 text-sky-700 bg-white rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-8">
          {/* TAB 1: SKILLS MATRIX */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Extracted & Declared Skills</h3>
                  <p className="text-xs text-slate-500">
                    Verify skills extracted from your CV. Adjust proficiency levels or add missing skills manually.
                  </p>
                </div>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={addSkill}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                )}
              </div>

              {skills.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No skills listed yet. Upload a CV or click "Add Skill" above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={skill.name}
                          disabled={isLocked}
                          onChange={(e) => updateSkill(idx, 'name', e.target.value)}
                          placeholder="Skill name (e.g. React.js)"
                          className="w-full text-xs font-bold bg-white px-2 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 outline-none"
                        />
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => removeSkill(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-500 font-medium">Proficiency:</span>
                        <select
                          value={skill.proficiency}
                          disabled={isLocked}
                          onChange={(e) => updateSkill(idx, 'proficiency', e.target.value)}
                          className="bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-800 font-semibold outline-none"
                        >
                          {PROFICIENCIES.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GENERAL CONTACT & SUMMARY */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    disabled={isLocked}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 block w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled={isLocked}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 block w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    disabled={isLocked}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1.5 block w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    disabled={isLocked}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State / Remote"
                    className="mt-1.5 block w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Professional Executive Summary
                </label>
                <textarea
                  rows={4}
                  value={summary}
                  disabled={isLocked}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summarize your technical strengths and background..."
                  className="mt-1.5 block w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Academic Background</h3>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={addEducation}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                )}
              </div>

              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      disabled={isLocked}
                      onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                      placeholder="University name"
                      className="mt-1 w-full text-xs font-semibold px-2 py-1.5 rounded-lg border bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      disabled={isLocked}
                      onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                      placeholder="B.S. / B.Tech"
                      className="mt-1 w-full text-xs font-semibold px-2 py-1.5 rounded-lg border bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Field of Study</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      disabled={isLocked}
                      onChange={(e) => updateEducation(idx, 'fieldOfStudy', e.target.value)}
                      placeholder="Computer Science"
                      className="mt-1 w-full text-xs font-semibold px-2 py-1.5 rounded-lg border bg-white outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Grad Year</label>
                      <input
                        type="text"
                        value={edu.graduationYear}
                        disabled={isLocked}
                        onChange={(e) => updateEducation(idx, 'graduationYear', e.target.value)}
                        placeholder="2024"
                        className="mt-1 w-full text-xs font-semibold px-2 py-1.5 rounded-lg border bg-white outline-none"
                      />
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="mt-4 p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Key Projects & Portfolios</h3>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={addProject}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                )}
              </div>

              {projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={proj.title}
                      disabled={isLocked}
                      onChange={(e) => updateProject(idx, 'title', e.target.value)}
                      placeholder="Project Title (e.g. Distributed Task Engine)"
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border bg-white outline-none"
                    />
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => removeProject(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={proj.description}
                    disabled={isLocked}
                    onChange={(e) => updateProject(idx, 'description', e.target.value)}
                    placeholder="Project description, architecture, problem solved..."
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-white outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Certifications & Accreditations</h3>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={addCertification}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certification</span>
                  </button>
                )}
              </div>

              {certifications.map((cert, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Certification Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      disabled={isLocked}
                      onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                      placeholder="e.g. AWS Certified Developer"
                      className="mt-1 w-full text-xs font-semibold px-2 py-1.5 rounded-lg border bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuingOrganization}
                      disabled={isLocked}
                      onChange={(e) => updateCertification(idx, 'issuingOrganization', e.target.value)}
                      placeholder="e.g. Amazon Web Services"
                      className="mt-1 w-full text-xs font-semibold px-2 py-1.5 rounded-lg border bg-white outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Year</label>
                      <input
                        type="text"
                        value={cert.issueDate}
                        disabled={isLocked}
                        onChange={(e) => updateCertification(idx, 'issueDate', e.target.value)}
                        placeholder="2024"
                        className="mt-1 w-full text-xs font-semibold px-2 py-1.5 rounded-lg border bg-white outline-none"
                      />
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => removeCertification(idx)}
                        className="mt-4 p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
