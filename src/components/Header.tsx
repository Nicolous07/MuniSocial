import React, { useState, useRef, useEffect } from 'react';
import muniLogo from '../assets/images/munisocial_logo_1785063397683.jpg';
import { 
  Sparkles, 
  Search, 
  Bell, 
  PlusCircle, 
  Bot, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Flame,
  X,
  Menu
} from 'lucide-react';
import { ViewMode, UserProfile, NotificationItem } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  user: UserProfile;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenCreate: () => void;
  onToggleAiDrawer: () => void;
  isAiDrawerOpen: boolean;
  notifications: NotificationItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAuth: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  user,
  isDarkMode,
  onToggleTheme,
  onOpenCreate,
  onToggleAiDrawer,
  isAiDrawerOpen,
  notifications,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onOpenMobileMenu
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Auto-close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 transition-colors duration-200 border-b bg-slate-950/95 border-slate-800/80 backdrop-blur-xl text-white">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Mobile Menu Button + Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onOpenMobileMenu && (
            <button 
              onClick={onOpenMobileMenu}
              className="p-1.5 sm:p-2 rounded-xl md:hidden border transition-all bg-slate-900 border-slate-800 text-slate-200 hover:text-white"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <button 
            id="brand-logo-btn"
            onClick={() => onSelectView('feed')} 
            className="flex items-center gap-1.5 sm:gap-2 text-left group shrink-0"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              <img 
                src={muniLogo} 
                alt="MuniSocial Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-[10px] object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-white">
                  MuniSocial
                </span>
                <span className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">
                  AI v3.5
                </span>
              </div>
              <p className="text-[9px] text-slate-400 tracking-wider font-semibold hidden sm:block">
                by Municryptrix
              </p>
            </div>
          </button>
        </div>

        {/* Global AI Semantic Search */}
        <div ref={searchRef} className="flex-1 max-w-lg mx-1 relative">
          <div className={`relative flex items-center transition-all duration-200 rounded-full border ${
            isSearchFocused 
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10 bg-slate-900' 
              : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
          }`}>
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2.5 sm:ml-3.5 text-slate-400 shrink-0" />
            <input 
              id="global-search-input"
              type="text"
              placeholder="Search posts, videos, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full py-1.5 sm:py-2 pl-2 pr-6 sm:pr-8 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-100 placeholder-slate-400 font-semibold"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 mr-1 text-slate-400 hover:text-indigo-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="hidden lg:flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 font-bold">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>AI Search</span>
            </div>
          </div>

          {/* Quick Search Dropdown suggestions */}
          {isSearchFocused && searchQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border p-3 shadow-2xl z-50 bg-slate-900 border-slate-800 text-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>AI Grounded Search Suggestions</span>
                <span className="text-indigo-400 flex items-center gap-1 font-bold">
                  <Flame className="w-3 h-3" /> Gemini 3.6
                </span>
              </div>
              <div className="space-y-1">
                {[`Videos about "${searchQuery}"`, `Threads discussing ${searchQuery}`, `MuniAI Code Snippets for ${searchQuery}`, `Creators matching ${searchQuery}`].map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setSearchQuery(s);
                      setIsSearchFocused(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center justify-between transition-colors font-bold text-slate-200"
                  >
                    <span>{s}</span>
                    <Sparkles className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls - Compact Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Create Button */}
          <button
            id="header-create-btn"
            onClick={onOpenCreate}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-[11px] sm:text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Create</span>
          </button>

          {/* MuniAI Assistant Drawer Trigger */}
          <button
            id="header-ai-copilot-btn"
            onClick={onToggleAiDrawer}
            className={`relative p-1.5 sm:p-2 rounded-full border transition-all flex items-center gap-1 text-xs font-semibold ${
              isAiDrawerOpen 
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' 
                : 'bg-slate-900 border-slate-800 text-indigo-300 hover:border-indigo-500/50 hover:bg-slate-800'
            }`}
            title="Open MuniAI Copilot"
          >
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 animate-bounce" />
            <span className="hidden md:inline text-[11px]">MuniAI</span>
          </button>

          {/* Notifications Trigger */}
          <div ref={notificationsRef} className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 rounded-full border transition-colors relative bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-2xl p-3 z-50 bg-slate-900 border-slate-800 text-slate-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <h3 className="font-heading font-bold text-xs sm:text-sm flex items-center gap-1.5 text-white">
                    <Bell className="w-4 h-4 text-indigo-400" /> Notifications
                  </h3>
                  <span className="text-[10px] text-indigo-400 font-medium">Real-Time</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => setShowNotifications(false)}
                      className="flex gap-2.5 text-xs p-2 rounded-xl border transition-colors bg-slate-800/40 border-slate-800 hover:bg-slate-800 cursor-pointer"
                    >
                      <img src={n.actor.avatar} alt={n.actor.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-200">
                          <span className="font-bold text-white">{n.actor.name}</span>{' '}
                          <span className="text-slate-400">{n.content}</span>
                        </p>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">{n.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              id="header-user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-0.5 rounded-full border border-slate-800 hover:border-indigo-500 transition-all"
            >
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-indigo-500/30"
              />
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block mx-0.5" />
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border shadow-2xl p-2 z-50 bg-slate-900 border-slate-800 text-slate-100">
                <div className="p-2.5 border-b border-slate-800 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <span>{user.name}</span>
                    {user.verified && <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">@{user.username}</p>
                </div>
                
                <div className="space-y-1">
                  <button 
                    onClick={() => { onSelectView('profile'); setShowUserMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-2 transition-colors text-slate-200"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" /> View Profile & Badges
                  </button>
                  <button 
                    onClick={() => { onSelectView('creator-studio'); setShowUserMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-2 transition-colors text-slate-200"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Creator Studio & Revenue
                  </button>
                  <button 
                    onClick={() => { onOpenAuth(); setShowUserMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-2 transition-colors text-slate-200"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" /> Security & Passkeys
                  </button>
                  <div className="my-1 border-t border-slate-800"></div>
                  <button 
                    onClick={() => { onOpenAuth(); setShowUserMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-red-500/10 text-red-400 flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Switch Account / Security
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
