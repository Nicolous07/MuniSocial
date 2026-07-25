import React, { useState } from 'react';
import { 
  Users, 
  Hash, 
  Volume2, 
  MessageSquare, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Radio, 
  Search,
  Lock,
  Globe
} from 'lucide-react';
import { Community, UserProfile } from '../types';

interface CommunitiesViewProps {
  communities: Community[];
  user: UserProfile;
  isDarkMode: boolean;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  communities,
  user,
  isDarkMode
}) => {
  const [activeCommunity, setActiveCommunity] = useState<Community>(communities[0]);
  const [activeChannelId, setActiveChannelId] = useState<string>(communities[0].channels[0].id);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({ comm_1: true, comm_3: true });

  const toggleJoin = (commId: string) => {
    setJoinedMap(prev => ({ ...prev, [commId]: !prev[commId] }));
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl">MuniCommunities</h1>
            <p className="text-xs text-slate-400">Discord-style channels, forums, events, and voice stages</p>
          </div>
        </div>

        <button 
          onClick={() => alert('New Community Creation Workflow')}
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Community</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Community List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-heading font-bold text-xs uppercase text-slate-400 px-1">Discover & Joined</h3>
          {communities.map((comm) => {
            const isJoined = joinedMap[comm.id] || false;
            const isSelected = activeCommunity.id === comm.id;

            return (
              <div
                key={comm.id}
                onClick={() => {
                  setActiveCommunity(comm);
                  setActiveChannelId(comm.channels[0].id);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500/50' 
                    : isDarkMode 
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={comm.avatar} alt={comm.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1">
                      <span>{comm.name}</span>
                      {comm.isPrivate ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-emerald-400" />}
                    </h4>
                    <span className="text-[10px] text-slate-400">{comm.membersCount.toLocaleString()} Members</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleJoin(comm.id);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                    isJoined 
                      ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isJoined ? 'Joined' : 'Join'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Active Community Channels & Feed */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 h-36">
            <img src={activeCommunity.banner} alt="Banner" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex items-end justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-white">{activeCommunity.name}</h2>
                <p className="text-xs text-slate-300 line-clamp-1">{activeCommunity.description}</p>
              </div>
            </div>
          </div>

          {/* Channels Row */}
          <div className={`p-3 rounded-2xl border flex items-center gap-2 overflow-x-auto no-scrollbar ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {activeCommunity.channels.map((ch) => {
              const isSelected = activeChannelId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'bg-slate-950/50 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {ch.type === 'voice' ? <Radio className="w-3.5 h-3.5 text-pink-400" /> : <Hash className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{ch.name}</span>
                </button>
              );
            })}
          </div>

          {/* Rules & Community Details */}
          <div className={`p-5 rounded-3xl border space-y-3 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="font-bold text-xs uppercase text-slate-400">Community Rules & Guidelines</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeCommunity.rules.map((rule, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <span className="font-mono text-indigo-400 font-bold">{idx + 1}.</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
