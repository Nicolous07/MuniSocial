import React from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Eye, 
  Clock, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Play, 
  Globe, 
  Award,
  Zap,
  Layers
} from 'lucide-react';
import { CreatorAnalytics, UserProfile } from '../types';

interface CreatorStudioViewProps {
  analytics: CreatorAnalytics;
  user: UserProfile;
  isDarkMode: boolean;
}

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  analytics,
  user,
  isDarkMode
}) => {
  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl">MuniCreator Studio</h1>
            <p className="text-xs text-slate-400">Real-time monetization, ad splits, and audience analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" /> Monetization Status: Active
          </span>
        </div>
      </div>

      {/* Revenue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-400">${analytics.totalRevenue.toLocaleString()}</div>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 block">+18.4% from last month</span>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Monthly Views</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-indigo-300">{(analytics.monthlyViews / 1000000).toFixed(2)}M</div>
          <span className="text-[10px] font-mono text-indigo-400 mt-1 block">4.89M total impressions</span>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Watch Hours</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-purple-300">{(analytics.watchTimeHours / 1000).toFixed(1)}k hrs</div>
          <span className="text-[10px] font-mono text-purple-400 mt-1 block">Avg retention: 84%</span>
        </div>

        <div className={`p-5 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Subscribers</span>
            <Users className="w-4 h-4 text-pink-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-pink-400">{analytics.subscriberCount.toLocaleString()}</div>
          <span className="text-[10px] font-mono text-pink-400 mt-1 block">+12.4k this week</span>
        </div>

      </div>

      {/* Revenue Breakdown & Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Sources */}
        <div className={`lg:col-span-5 p-5 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <h3 className="font-heading font-bold text-sm uppercase text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Revenue Stream Breakdown
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Ad Revenue Split (70% Creator)</span>
                <span className="font-mono font-bold text-emerald-400">${analytics.adRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Premium Creator Subscriptions</span>
                <span className="font-mono font-bold text-indigo-400">${analytics.subscriberRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Tips, Stars & Super Chats</span>
                <span className="font-mono font-bold text-amber-400">${analytics.tipsAndStars.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Videos Table */}
        <div className={`lg:col-span-7 p-5 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <h3 className="font-heading font-bold text-sm uppercase text-slate-400 flex items-center gap-2">
            <Play className="w-4 h-4 text-indigo-400" /> Top Performing Videos & Streams
          </h3>

          <div className="space-y-2.5">
            {analytics.topVideos.map((v, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-200 line-clamp-1">{v.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{v.views.toLocaleString()} views</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  +${v.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
