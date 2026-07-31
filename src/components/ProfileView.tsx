import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  MapPin, 
  Globe, 
  Briefcase, 
  Calendar, 
  Award, 
  KeyRound, 
  Smartphone, 
  Lock, 
  Sparkles, 
  CheckCircle2,
  Edit,
  Flame,
  Zap
} from 'lucide-react';
import { UserProfile, SocialPost } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  posts: SocialPost[];
  isDarkMode: boolean;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  posts,
  isDarkMode,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'achievements' | 'security'>('posts');
  const userPosts = posts.filter(p => p.author.id === user.id || p.author.username === user.username);

  const [secState, setSecState] = useState(user.securitySettings);

  const toggle2FA = () => setSecState(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
  const togglePasskey = () => setSecState(prev => ({ ...prev, passkeyActive: !prev.passkeyActive }));
  const toggleBio = () => setSecState(prev => ({ ...prev, biometricEnabled: !prev.biometricEnabled }));

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Cover & Avatar Header */}
      <div className={`rounded-3xl border overflow-hidden ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="relative h-48 sm:h-60 bg-slate-950">
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-slate-950 shadow-2xl border-2 border-indigo-500/40" 
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl">{user.name}</h1>
                {user.verified && <ShieldCheck className="w-5 h-5 text-indigo-400" />}
                <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  {user?.role?.toUpperCase() || 'CREATOR'}
                </span>
              </div>
              <p className="text-xs text-slate-400">@{user.username} • {user.profession}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Auth & Security</span>
            </button>
          </div>

        </div>

        {/* Bio & Links */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 space-y-3 text-xs">
          <p className="text-slate-300 leading-relaxed font-sans">{user.bio}</p>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {user.location}</span>
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-indigo-400" /> <a href={user.website} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{user.website}</a></span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Joined {user.joinedDate}</span>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 pt-2 font-mono text-xs border-t border-slate-800/40">
            <div><span className="font-bold text-white">{(user?.followersCount ?? 0).toLocaleString()}</span> <span className="text-slate-400">Followers</span></div>
            <div><span className="font-bold text-white">{(user?.followingCount ?? 0).toLocaleString()}</span> <span className="text-slate-400">Following</span></div>
            <div><span className="font-bold text-white">{(user?.friendsCount ?? 0).toLocaleString()}</span> <span className="text-slate-400">Friends</span></div>
            <div><span className="font-bold text-white">{(user?.totalViews ?? 0).toLocaleString()}</span> <span className="text-slate-400">Total Views</span></div>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className={`p-2 rounded-2xl border flex items-center gap-2 ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {[
          { id: 'posts', label: 'My Posts & Media' },
          { id: 'achievements', label: 'Badges & Achievements' },
          { id: 'security', label: 'Security & Biometrics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.map((p) => (
            <div key={p.id} className="p-4 rounded-3xl border border-slate-800 bg-slate-900/80 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                <span>Type: {p.type}</span>
                <span>{p.createdAt}</span>
              </div>
              <p className="text-slate-200">{p.content}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Platform Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((b, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" /> Verified Achievements
            </h3>
            <div className="space-y-2">
              {user.achievements.map((a, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="font-heading font-bold text-sm uppercase text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" /> Security, Passkeys & Biometric Settings
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200">Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-slate-400">TOTP Authenticator & SMS Verification</p>
              </div>
              <input type="checkbox" checked={secState.twoFactorEnabled} onChange={toggle2FA} className="w-4 h-4 accent-indigo-600" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200">Passkeys (WebAuthn / Touch ID / Face ID)</h4>
                <p className="text-[11px] text-slate-400">Passwordless cryptographic biometric key</p>
              </div>
              <input type="checkbox" checked={secState.passkeyActive} onChange={togglePasskey} className="w-4 h-4 accent-indigo-600" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200">Biometric Login Prompts</h4>
                <p className="text-[11px] text-slate-400">Require fingerprint or facial scan on app startup</p>
              </div>
              <input type="checkbox" checked={secState.biometricEnabled} onChange={toggleBio} className="w-4 h-4 accent-indigo-600" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
