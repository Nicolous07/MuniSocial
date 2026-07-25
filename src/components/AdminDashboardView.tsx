import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Database, 
  Users, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Cpu
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdminDashboardViewProps {
  user: UserProfile;
  isDarkMode: boolean;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  user,
  isDarkMode
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl">MuniSocial Admin & Security Control</h1>
            <p className="text-xs text-slate-400">System health, automated AI moderation, roles & cluster backups</p>
          </div>
        </div>

        <button
          onClick={handleBackup}
          disabled={isBackingUp}
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
          <span>{isBackingUp ? 'Triggering Backup...' : 'Trigger PostgreSQL Backup'}</span>
        </button>
      </div>

      {backupSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> Snapshot created on Cloudflare R2 / AWS S3 backup storage.
        </div>
      )}

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cluster Status</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading font-bold text-lg text-emerald-400">99.998% Healthy</div>
          <span className="text-[10px] text-slate-500 font-mono">1.2B Active Nodes</span>
        </div>

        <div className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>AI Moderation Queue</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-heading font-bold text-lg text-indigo-300">0 Pending Violations</div>
          <span className="text-[10px] text-slate-500 font-mono">Gemini Auto-filtered 12 spam posts</span>
        </div>

        <div className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Security Alerts</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading font-bold text-lg text-amber-400">Zero Vulnerabilities</div>
          <span className="text-[10px] text-slate-500 font-mono">Passkeys & 2FA active</span>
        </div>

        <div className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Database Storage</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-heading font-bold text-lg text-purple-300">14.2 TB / 100 TB</div>
          <span className="text-[10px] text-slate-500 font-mono">PostgreSQL + Redis Cached</span>
        </div>

      </div>

      {/* Audit Logs Table */}
      <div className={`p-5 rounded-3xl border space-y-3 ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200'
      }`}>
        <h3 className="font-heading font-bold text-xs uppercase text-slate-400">Real-time Automated Moderation & Security Audit Logs</h3>
        <div className="space-y-2">
          {[
            { action: 'AI Content Inspection', status: 'Passed', detail: 'Checked video caption for copyright compliance.', time: '2m ago' },
            { action: 'Passkey Auth Event', status: 'Success', detail: 'User @alexrivera authenticated via WebAuthn Biometric.', time: '5m ago' },
            { action: 'Spam Rate Limit Shield', status: 'Blocked', detail: 'Throttled 14 requests/sec from IP 192.168.1.42.', time: '12m ago' },
          ].map((log, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2 font-bold">
                  <span>{log.action}</span>
                  <span className="px-2 py-0.2 text-[9px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {log.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{log.detail}</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
