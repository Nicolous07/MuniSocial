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
        } ${isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-800'}`}>
          {!collapsed && (
            <div className="text-[10px] font-extrabold tracking-widest uppercase flex items-center gap-1">
              <span>Main Ecosystem</span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-mono">
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
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'
              }`}
              title={collapsed ? "Expand Sidebar (Open)" : "Collapse Sidebar (Closed)"}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> : <PanelLeftClose className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />}
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
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all group ${
                collapsed 
                  ? 'justify-center p-3' 
                  : 'justify-between px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/30'
                  : isDarkMode
                    ? 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
                    : 'hover:bg-slate-200/80 text-slate-900 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                }`} />
                {!collapsed && <span className={isActive ? 'text-white' : 'text-slate-900 dark:text-slate-200'}>{item.label}</span>}
              </div>
            </button>
          );
        })}
      </div>


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
