import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Compass,
  MessageSquareCode,
  History,
  ShieldCheck,
  LogOut,
  ChevronDown,
  User,
  Briefcase
} from 'lucide-react';

const TARGET_ROLES = [
  'Software Developer',
  'Python Developer',
  'Data Analyst',
  'Web Developer',
  'Java Developer'
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, updateTargetRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleRoleSelect = async (role) => {
    try {
      await updateTargetRole(role);
      setRoleDropdownOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Smart Career Assistant
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                v1.0
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-sky-600 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-lg shadow-sm shadow-sky-600/30 transition-all hover:shadow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cv-profile', label: 'CV Profile', icon: FileText },
    { to: '/skill-gap', label: 'Skill Gap & Roadmap', icon: Compass },
    { to: '/interview', label: 'AI Mock Interview', icon: MessageSquareCode },
    { to: '/history', label: 'History', icon: History }
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin Panel', icon: ShieldCheck, badge: 'Admin' });
  }

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Smart Career Assistant
              </span>
              <div className="text-[11px] font-medium text-slate-500 -mt-1">
                AI Career Acceleration
              </div>
            </div>
          </Link>

          {/* Target Role Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors"
              title="Click to switch target role"
            >
              <Briefcase className="w-3.5 h-3.5 text-sky-600" />
              <span className="max-w-[130px] sm:max-w-none truncate">
                {user?.targetRoleTitle || 'Select Role'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-sky-500" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Job Role (v1.0)
                </div>
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-sky-50 hover:text-sky-700 transition-colors ${
                      user?.targetRoleTitle === role ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>{role}</span>
                    {user?.targetRoleTitle === role && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-slate-800 leading-tight truncate max-w-[100px]">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] font-medium text-slate-500 capitalize">
                  {user?.role || 'Student'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/cv-profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Admin Controls</span>
                  </Link>
                )}
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
