import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Layers,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  BookOpen
} from 'lucide-react';

const PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function AdminDashboardPage() {
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [rolesRes, statsRes] = await Promise.all([
        adminService.getRoles(),
        adminService.getStats()
      ]);
      if (rolesRes.success) setRoles(rolesRes.roles || []);
      if (statsRes.success) setStats(statsRes.stats || null);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load administrator metrics.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRoleId(null);
    setRoleTitle('');
    setCategory('Engineering');
    setDescription('');
    setRequiredSkills([
      { name: 'Core Foundations', category: 'Core', minimumProficiency: 'Intermediate', weight: 4, description: 'Fundamental principles' }
    ]);
    setIsModalOpen(true);
    setMessage(null);
    setError(null);
  };

  const openEditModal = (role) => {
    setEditingRoleId(role._id);
    setRoleTitle(role.title);
    setCategory(role.category || 'Engineering');
    setDescription(role.description || '');
    setRequiredSkills(role.requiredSkills ? JSON.parse(JSON.stringify(role.requiredSkills)) : []);
    setIsModalOpen(true);
    setMessage(null);
    setError(null);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleTitle || !description) {
      setError('Title and Description are required.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: roleTitle,
      category,
      description,
      requiredSkills
    };

    try {
      if (editingRoleId) {
        const res = await adminService.updateRole(editingRoleId, payload);
        if (res.success) {
          setMessage(`Job role '${roleTitle}' updated successfully.`);
        }
      } else {
        const res = await adminService.createRole(payload);
        if (res.success) {
          setMessage(`Job role '${roleTitle}' created successfully.`);
        }
      }
      setIsModalOpen(false);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id, title) => {
    if (!window.confirm(`Are you sure you want to deactivate job role '${title}'?`)) return;

    try {
      const res = await adminService.deleteRole(id);
      if (res.success) {
        setMessage(`Job role '${title}' deactivated.`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete role.');
    }
  };

  // Skill matrix row helpers inside modal
  const addSkillRow = () => {
    setRequiredSkills([
      ...requiredSkills,
      { name: '', category: 'Technical', minimumProficiency: 'Intermediate', weight: 4, description: '' }
    ]);
  };

  const updateSkillRow = (idx, field, val) => {
    const updated = [...requiredSkills];
    updated[idx][field] = val;
    setRequiredSkills(updated);
  };

  const removeSkillRow = (idx) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner message="Loading Admin Dashboard & Role Catalogs..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administration & Job Matrix Controls
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Module 5 Admin</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            FR-5-01 & FR-5-02: Manage target job roles, customize required skill sets, and inspect platform analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Job Role</span>
        </button>
      </div>

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

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Active Roles</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.totalJobRoles || roles.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Initial v1.0 standard scope</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Interviews</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.totalInterviews || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Sessions launched</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Completed Sessions</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{stats?.completedInterviews || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Fully evaluated scorecards</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Average Interview Score</div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-1">{stats?.averageInterviewScore || 0}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Aggregate candidate benchmark</p>
        </div>
      </div>

      {/* Job Roles Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Job Roles & Skill Matrices (FR-5-01, FR-5-02)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit the baseline required competencies, weights, and minimum proficiency levels for each target career path.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Skills Count</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {roles.map((role) => (
                <tr key={role._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {role.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {role.category || 'Engineering'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {(role.requiredSkills || []).length} Skills
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {role.description}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(role)}
                      className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                      title="Edit role and required skills"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRole(role._id, role.title)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Deactivate role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoleId ? `Edit Job Role: ${roleTitle}` : 'Create New Job Role'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Role Title</label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Cloud DevOps Engineer"
                    className="mt-1 block w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Engineering / Analytics"
                    className="mt-1 block w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive description of responsibilities and technical expectations..."
                  className="mt-1 block w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 outline-none"
                />
              </div>

              {/* Skills Matrix Modifier (FR-5-02) */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <label className="text-xs font-bold text-slate-900 uppercase">
                    Required Skill Sets & Proficiency Matrix (FR-5-02)
                  </label>
                  <button
                    type="button"
                    onClick={addSkillRow}
                    className="flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill Requirement</span>
                  </button>
                </div>

                <div className="space-y-2 mt-3 max-h-64 overflow-y-auto pr-1">
                  {requiredSkills.map((sk, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          required
                          value={sk.name}
                          onChange={(e) => updateSkillRow(idx, 'name', e.target.value)}
                          placeholder="Skill name (e.g. Docker)"
                          className="w-full px-2 py-1.5 rounded-lg border bg-white outline-none font-medium"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <select
                          value={sk.minimumProficiency}
                          onChange={(e) => updateSkillRow(idx, 'minimumProficiency', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border bg-white outline-none"
                        >
                          {PROFICIENCIES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3 flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Weight:</span>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={sk.weight || 4}
                          onChange={(e) => updateSkillRow(idx, 'weight', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 rounded-lg border bg-white outline-none text-center font-bold"
                        />
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removeSkillRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Job Role & Matrix'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
