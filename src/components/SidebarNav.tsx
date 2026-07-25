import React from 'react';
import { 
  Home, 
  PlaySquare, 
  Tv, 
  MessageSquareCode, 
  Users, 
  ShoppingBag, 
  MessageCircle, 
  Bot, 
  BarChart3, 
  ShieldAlert, 
  User,
  Sparkles,
  Zap,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  isDarkMode: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentView,
  onSelectView,
  isDarkMode,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'feed' as ViewMode, label: 'Home Feed', icon: Home, badge: 'AI Ranked' },
    { id: 'shorts' as ViewMode, label: 'Shorts Reels', icon: PlaySquare, badge: 'TikTok' },
    { id: 'watch' as ViewMode, label: 'MuniWatch 4K', icon: Tv, badge: '4K/8K' },
    { id: 'threads' as ViewMode, label: 'MuniThreads', icon: MessageSquareCode, badge: 'Live' },
    { id: 'communities' as ViewMode, label: 'Communities', icon: Users, badge: 'Groups' },
    { id: 'marketplace' as ViewMode, label: 'Marketplace', icon: ShoppingBag, badge: 'Shop' },
    { id: 'messages' as ViewMode, label: 'Messages', icon: MessageCircle, badge: 'Chat' },
    { id: 'muniai' as ViewMode, label: 'MuniAI Copilot', icon: Bot, badge: 'Gemini' },
    { id: 'creator-studio' as ViewMode, label: 'Creator Studio', icon: BarChart3, badge: '$$' },
    { id: 'admin' as ViewMode, label: 'Admin Panel', icon: ShieldAlert, badge: 'Control' },
    { id: 'profile' as ViewMode, label: 'Profile & Security', icon: User, badge: 'Passkey' },
  ];

  const renderNavContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-1">
        
        {/* Toggle Collapse Header Button */}
        <div className={`pb-3 mb-2 border-b flex items-center justify-between ${
          collapsed ? 'px-1 justify-center' : 'px-3'
        } ${isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
          {!collapsed && (
            <div className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
              <span>Main Ecosystem</span>
              <span className="flex items-center gap-1 text-indigo-500 font-mono">
                <Zap className="w-3 h-3 animate-bounce" /> 1.2B
              </span>
            </div>
          )}

          {onToggleCollapse && (
            <button 
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-xl border transition-all ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title={collapsed ? "Expand Sidebar (Open)" : "Collapse Sidebar (Closed)"}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4 text-indigo-400" /> : <PanelLeftClose className="w-4 h-4 text-indigo-400" />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                onSelectView(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              title={collapsed ? `${item.label} (${item.badge})` : undefined}
              className={`w-full flex items-center rounded-2xl text-xs font-semibold transition-all group ${
                collapsed 
                  ? 'justify-center p-3' 
                  : 'justify-between px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/30'
                  : isDarkMode
                    ? 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
                    : 'hover:bg-slate-200/80 text-slate-700 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'
                }`} />
                {!collapsed && <span>{item.label}</span>}
              </div>
              
              {!collapsed && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : isDarkMode 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MuniAI Pro Upgrade / Status Card (When Expanded) */}
      {!collapsed && (
        <div className={`mt-6 p-4 rounded-2xl border relative overflow-hidden transition-all ${
          isDarkMode 
            ? 'bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-slate-900 border-indigo-500/30 text-slate-200' 
            : 'bg-gradient-to-b from-indigo-50 via-purple-50 to-white border-indigo-200 text-slate-800 shadow-sm'
        }`}>
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"></div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="font-heading font-bold text-xs text-indigo-600 dark:text-indigo-400">MuniSocial Global</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            Powered by Municryptrix enterprise AI infrastructure. Zero friction, total privacy.
          </p>
          <button 
            id="sidebar-upgrade-btn"
            onClick={() => {
              onSelectView('creator-studio');
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-1.5 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" /> Creator Monetization Active
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`shrink-0 hidden md:block py-6 px-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isDarkMode ? 'bg-slate-950/80 border-slate-800/80 text-slate-200' : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
      }`}>
        {renderNavContent(isCollapsed)}
      </aside>

      {/* Mobile Slide-Over Drawer Navigation */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm flex">
          <div className={`w-72 max-w-[80vw] h-full p-4 flex flex-col justify-between border-r shadow-2xl animate-in slide-in-from-left duration-200 ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span className="font-heading font-extrabold text-base bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  MuniSocial Navigation
                </span>
              </div>
              <button 
                onClick={onCloseMobile}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {renderNavContent(false)}
            </div>
          </div>

          <div className="flex-1" onClick={onCloseMobile}></div>
        </div>
      )}
    </>
  );
};
