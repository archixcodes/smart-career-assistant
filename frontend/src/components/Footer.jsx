import React from 'react';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/60 py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-sky-600 flex items-center justify-center text-white">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-semibold text-slate-700">Smart Career Assistant</span>
          <span className="text-slate-400">|</span>
          <span>Version 1.0 Production</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Cpu className="w-3.5 h-3.5 text-sky-500" />
            <span>AI Adaptive Engine</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>JWT & RBAC Secured</span>
          </div>
        </div>

        <div className="text-slate-400">
          Built for modern university & enterprise placement readiness.
        </div>
      </div>
    </footer>
  );
}
