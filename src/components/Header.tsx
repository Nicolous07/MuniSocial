import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Menu as MenuIcon,
  Clock,
  Trash2,
  LayoutGrid,
  Calendar,
  Users,
  UserCheck,
  Newspaper,
  Flag,
  Radio,
  Clapperboard,
  Gamepad2,
  CreditCard,
  ShoppingBag,
  BarChart3,
  Bookmark,
  Award,
  MessageCircle,
  Smartphone,
  Instagram,
  Megaphone,
  Star,
  Edit3,
  Tv,
  BookOpen
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

const MenuItem: React.FC<{
  icon: React.ElementType;
  iconBg: string;
  title: string;
  desc: string;
  onClick: () => void;
  searchQuery?: string;
}> = ({ icon: IconComp, iconBg, title, desc, onClick, searchQuery }) => {
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const matches = title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    if (!matches) return null;
  }

  return (
    <button
      onClick={onClick}
      className="w-full p-2 sm:p-2.5 rounded-xl hover:bg-slate-900/90 border border-transparent hover:border-slate-800/80 transition-all text-left flex items-start gap-3 group"
    >
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${iconBg} border flex items-center justify-center shrink-0 mt-0.5 shadow-xs transition-transform group-hover:scale-105`}>
        <IconComp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
          <span>{title}</span>
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-400 leading-snug line-clamp-2">{desc}</div>
      </div>
    </button>
  );
};

const MenuCategorySection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div className="space-y-1">
      <h3 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-1 border-b border-slate-800/60 mb-1">
        {title}
      </h3>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
};

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
  const [showEcosystemMenu, setShowEcosystemMenu] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const ecosystemMenuRef = useRef<HTMLDivElement>(null);

  // Recent Searches state with localStorage persistence
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('muni_recent_searches');
      return saved ? JSON.parse(saved) : ['Afrobeat beats', 'Gemini 3.6 API', 'Cyberpunk UI', 'React Tailwind code'];
    } catch {
      return ['Afrobeat beats', 'Gemini 3.6 API', 'Cyberpunk UI', 'React Tailwind code'];
    }
  });

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches(prev => {
      const updated = [trimmed, ...prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem('muni_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return updated;
    });
  };

  // Debounced auto-save for fully typed search queries (500ms delay)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 3) return;

    const timer = setTimeout(() => {
      addRecentSearch(trimmed);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const removeRecentSearch = (queryToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(q => q !== queryToRemove);
      try {
        localStorage.setItem('muni_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return updated;
    });
  };

  const clearAllRecentSearches = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('muni_recent_searches');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleSelectSearch = (query: string) => {
    setSearchQuery(query);
    addRecentSearch(query);
    setIsSearchFocused(false);
    setIsMobileSearchExpanded(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      setIsSearchFocused(false);
      setIsMobileSearchExpanded(false);
    }
  };

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
      if (ecosystemMenuRef.current && !ecosystemMenuRef.current.contains(event.target as Node)) {
        setShowEcosystemMenu(false);
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
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3 relative">
        
        {/* EXPANDED MOBILE SEARCH OVERLAY */}
        <AnimatePresence>
          {isMobileSearchExpanded && (
            <motion.div 
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl px-3 flex flex-col justify-center"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMobileSearchExpanded(false);
                    setIsSearchFocused(false);
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 shrink-0"
                  title="Close Search"
                >
                  <X className="w-5 h-5" />
                </button>

                <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-indigo-400" />
                  <input
                    id="mobile-global-search-input"
                    type="text"
                    autoFocus
                    placeholder="Search posts, videos, code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-indigo-500/80 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-indigo-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </form>
              </div>

              {/* Mobile Dropdown Menu (Recent Searches + AI Suggestions) */}
              <motion.div 
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-2 right-2 top-full mt-2.5 rounded-2xl border p-3.5 shadow-2xl z-50 bg-slate-900/85 backdrop-blur-2xl border-slate-700/60 text-slate-200 space-y-3 shadow-indigo-950/50 ring-1 ring-white/10"
              >
                {/* Recent Searches Section */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearAllRecentSearches}
                        className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Clear All
                      </button>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {recentSearches.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSearch(s)}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-xl hover:bg-indigo-500/15 hover:border-indigo-500/30 border border-transparent flex items-center justify-between font-medium text-slate-200 cursor-pointer group transition-all duration-150"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                            <span className="truncate group-hover:text-indigo-300 transition-colors">{s}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(s, e)}
                            className="p-1 rounded-lg hover:bg-slate-800/80 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                            title="Remove item"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Suggestions */}
                {searchQuery && (
                  <div className={recentSearches.length > 0 ? "pt-2 border-t border-slate-800/80" : ""}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>AI Suggestions</span>
                      <span className="text-indigo-400 flex items-center gap-1 font-bold">
                        <Flame className="w-3 h-3" /> Gemini 3.6
                      </span>
                    </div>
                    <div className="space-y-1">
                      {[`Videos about "${searchQuery}"`, `Threads discussing ${searchQuery}`, `Code snippets for ${searchQuery}`].map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSearch(s)}
                          className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-indigo-500/15 hover:text-indigo-300 flex items-center justify-between font-bold text-slate-200 transition-colors"
                        >
                          <span>{s}</span>
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Button + Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onOpenMobileMenu && (
            <button 
              onClick={onOpenMobileMenu}
              className="p-1.5 sm:p-2 rounded-xl md:hidden border transition-all bg-slate-900 border-slate-800 text-slate-200 hover:text-white"
              title="Open Navigation Menu"
            >
              <MenuIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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

        {/* Global AI Search - Responsive Desktop & Compact Mobile Trigger */}
        <div ref={searchRef} className="flex-1 max-w-lg mx-1 relative">
          
          {/* Mobile Search Icon Trigger Button */}
          <button
            onClick={() => setIsMobileSearchExpanded(true)}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-800 bg-slate-900 text-slate-300 text-xs font-medium w-full"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate text-slate-400">{searchQuery || "Search..."}</span>
          </button>

          {/* Desktop Search Input Form */}
          <form 
            onSubmit={handleSearchSubmit}
            className={`hidden md:flex items-center transition-all duration-200 rounded-full border ${
              isSearchFocused 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10 bg-slate-900' 
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
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
                type="button"
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
          </form>

          {/* Quick Search Dropdown suggestions */}
          <AnimatePresence>
            {isSearchFocused && (recentSearches.length > 0 || searchQuery) && (
              <motion.div 
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:block absolute left-0 right-0 top-full mt-2.5 rounded-2xl border p-3.5 shadow-2xl z-50 bg-slate-900/85 backdrop-blur-2xl border-slate-700/60 text-slate-200 space-y-3 shadow-indigo-950/50 ring-1 ring-white/10"
              >
                {/* Recent Searches Section */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearAllRecentSearches}
                        className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Clear All
                      </button>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {recentSearches.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSearch(s)}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-xl hover:bg-indigo-500/15 hover:border-indigo-500/30 border border-transparent flex items-center justify-between font-medium text-slate-200 cursor-pointer group transition-all duration-150"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                            <span className="truncate group-hover:text-indigo-300 transition-colors">{s}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(s, e)}
                            className="p-1 rounded-lg hover:bg-slate-800/80 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                            title="Remove item"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Grounded Search Suggestions Section */}
                {searchQuery && (
                  <div className={recentSearches.length > 0 ? "pt-2 border-t border-slate-800/80" : ""}>
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
                          type="button"
                          onClick={() => handleSelectSearch(s)}
                          className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-indigo-500/15 hover:text-indigo-300 flex items-center justify-between transition-colors font-bold text-slate-200"
                        >
                          <span>{s}</span>
                          <Sparkles className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
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

          {/* Ecosystem Grid Menu Button (Facebook/Meta Style Menu) */}
          <div ref={ecosystemMenuRef} className="relative">
            <button
              id="header-grid-menu-btn"
              onClick={() => setShowEcosystemMenu(!showEcosystemMenu)}
              className={`p-1.5 sm:p-2 rounded-full border transition-all flex items-center justify-center ${
                showEcosystemMenu 
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-500/30' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Open Ecosystem Menu"
            >
              <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Menu Dropdown Popup (Matching Facebook/Meta UI) */}
            <AnimatePresence>
              {showEcosystemMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 sm:-right-12 top-full mt-2.5 w-[92vw] sm:w-[620px] md:w-[720px] lg:w-[800px] max-h-[85vh] overflow-y-auto rounded-3xl border bg-slate-950/98 border-slate-800/90 backdrop-blur-2xl p-3.5 sm:p-5 shadow-2xl z-50 ring-1 ring-white/10 text-slate-100"
                >
                  {/* Header & Search */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80 mb-3.5 sticky top-0 bg-slate-950/95 backdrop-blur-xl z-20 py-1">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black font-heading text-white tracking-tight flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-indigo-400" /> Menu
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Explore apps, features, commerce & creation shortcuts</p>
                    </div>

                    {/* Search Menu Input */}
                    <div className="relative w-full sm:w-60">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                      <input
                        type="text"
                        placeholder="Search menu..."
                        value={menuSearchQuery}
                        onChange={(e) => setMenuSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-400 font-medium transition-all"
                      />
                      {menuSearchQuery && (
                        <button
                          onClick={() => setMenuSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2-Column Responsive Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* LEFT COLUMN: Categorized Navigation Items */}
                    <div className="md:col-span-7 lg:col-span-8 space-y-4 pr-0 md:pr-1 max-h-[60vh] overflow-y-auto">
                      
                      {/* Social Section */}
                      <MenuCategorySection title="Social">
                        <MenuItem 
                          icon={Calendar} 
                          iconBg="bg-rose-500/20 text-rose-400 border-rose-500/30"
                          title="Events" 
                          desc="Organize or find events and other things to do online and nearby." 
                          onClick={() => { onSelectView('feed'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={UserCheck} 
                          iconBg="bg-blue-500/20 text-blue-400 border-blue-500/30"
                          title="Friends" 
                          desc="Search for friends or people you may know." 
                          onClick={() => { onSelectView('profile'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Users} 
                          iconBg="bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                          title="Groups" 
                          desc="Connect with people who share your interests." 
                          onClick={() => { onSelectView('communities'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Newspaper} 
                          iconBg="bg-sky-500/20 text-sky-400 border-sky-500/30"
                          title="News Feed & Feeds" 
                          desc="See relevant posts from people and Pages you follow." 
                          onClick={() => { onSelectView('feed'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Flag} 
                          iconBg="bg-amber-500/20 text-amber-400 border-amber-500/30"
                          title="Pages" 
                          desc="Discover and connect with businesses on MuniSocial." 
                          onClick={() => { onSelectView('feed'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                      </MenuCategorySection>

                      {/* Entertainment Section */}
                      <MenuCategorySection title="Entertainment">
                        <MenuItem 
                          icon={Radio} 
                          iconBg="bg-pink-500/20 text-pink-400 border-pink-500/30 animate-pulse"
                          title="MuniLive (Tango.me)" 
                          desc="Interactive live stream rooms, PK Battle duels & real-time gifting." 
                          onClick={() => { onSelectView('live'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Clapperboard} 
                          iconBg="bg-purple-500/20 text-purple-400 border-purple-500/30"
                          title="Reels" 
                          desc="A Reels destination personalized to your interests and connections." 
                          onClick={() => { onSelectView('shorts'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Tv} 
                          iconBg="bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                          title="Gaming Video" 
                          desc="Watch and connect with your favorite games and streamers." 
                          onClick={() => { onSelectView('watch'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Gamepad2} 
                          iconBg="bg-purple-500/20 text-purple-400 border-purple-500/30"
                          title="Play Games" 
                          desc="Play your favorite instant and multiplayer games." 
                          onClick={() => { onSelectView('communities'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                      </MenuCategorySection>

                      {/* Shopping Section */}
                      <MenuCategorySection title="Shopping">
                        <MenuItem 
                          icon={CreditCard} 
                          iconBg="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          title="Orders and Payments" 
                          desc="A seamless, secure way to pay on the apps you already use." 
                          onClick={() => { onSelectView('marketplace'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={ShoppingBag} 
                          iconBg="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                          title="Marketplace" 
                          desc="Buy and sell in your community." 
                          onClick={() => { onSelectView('marketplace'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                      </MenuCategorySection>

                      {/* Personal Section */}
                      <MenuCategorySection title="Personal">
                        <MenuItem 
                          icon={BarChart3} 
                          iconBg="bg-blue-500/20 text-blue-400 border-blue-500/30"
                          title="Recent Ad Activity" 
                          desc="See all the ads you interacted with on MuniSocial." 
                          onClick={() => { onSelectView('creator-studio'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Clock} 
                          iconBg="bg-purple-500/20 text-purple-400 border-purple-500/30"
                          title="Memories" 
                          desc="Browse your old photos, videos and posts on MuniSocial." 
                          onClick={() => { onSelectView('profile'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Bookmark} 
                          iconBg="bg-pink-500/20 text-pink-400 border-pink-500/30"
                          title="Saved" 
                          desc="Find posts, photos and videos that you saved for later." 
                          onClick={() => { onSelectView('profile'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                      </MenuCategorySection>

                      {/* Professional Section */}
                      <MenuCategorySection title="Professional">
                        <MenuItem 
                          icon={BarChart3} 
                          iconBg="bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                          title="Ads Manager" 
                          desc="Create, manage and track the performance of your ads." 
                          onClick={() => { onSelectView('creator-studio'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Award} 
                          iconBg="bg-amber-500/20 text-amber-400 border-amber-500/30"
                          title="Creator Studio" 
                          desc="Monetization, analytics, and audience engagement tools." 
                          onClick={() => { onSelectView('creator-studio'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                      </MenuCategorySection>

                      {/* More from Meta / MuniSocial */}
                      <MenuCategorySection title="More from MuniSocial">
                        <MenuItem 
                          icon={Sparkles} 
                          iconBg="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md"
                          title="MuniAI Copilot" 
                          desc="Ask questions, brainstorm ideas, create any image or video you can imagine and more." 
                          onClick={() => { onSelectView('muniai'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={MessageCircle} 
                          iconBg="bg-blue-500/20 text-blue-400 border-blue-500/30"
                          title="Messenger / Direct Messages" 
                          desc="Message and call people privately on your computer." 
                          onClick={() => { onSelectView('messages'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Smartphone} 
                          iconBg="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          title="WhatsApp" 
                          desc="Message and call people privately on your phone or computer." 
                          onClick={() => { onSelectView('messages'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                        <MenuItem 
                          icon={Instagram} 
                          iconBg="bg-pink-500/20 text-pink-400 border-pink-500/30"
                          title="Instagram" 
                          desc="See everyday moments from people you love." 
                          onClick={() => { onSelectView('feed'); setShowEcosystemMenu(false); }} 
                          searchQuery={menuSearchQuery}
                        />
                      </MenuCategorySection>

                    </div>

                    {/* RIGHT COLUMN: "Create" Card (Right-hand creation shortcuts) */}
                    <div className="md:col-span-5 lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 space-y-2.5 h-fit sticky top-12 shadow-xl">
                      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="font-heading font-black text-sm text-white tracking-tight flex items-center gap-1.5">
                          Create
                        </h3>
                      </div>

                      <div className="space-y-1">
                        {[
                          { title: 'Post', icon: Edit3, action: () => { onOpenCreate(); setShowEcosystemMenu(false); } },
                          { title: 'Story', icon: BookOpen, action: () => { onOpenCreate(); setShowEcosystemMenu(false); } },
                          { title: 'Reel', icon: Clapperboard, action: () => { onSelectView('shorts'); setShowEcosystemMenu(false); } },
                          { title: 'Life update', icon: Star, action: () => { onOpenCreate(); setShowEcosystemMenu(false); } },
                          { divider: true },
                          { title: 'Page', icon: Flag, action: () => { onOpenCreate(); setShowEcosystemMenu(false); } },
                          { title: 'Ad', icon: Megaphone, action: () => { onSelectView('creator-studio'); setShowEcosystemMenu(false); } },
                          { title: 'Group', icon: Users, action: () => { onSelectView('communities'); setShowEcosystemMenu(false); } },
                          { title: 'Event', icon: Calendar, action: () => { onOpenCreate(); setShowEcosystemMenu(false); } },
                          { title: 'Marketplace listing', icon: ShoppingBag, action: () => { onSelectView('marketplace'); setShowEcosystemMenu(false); } }
                        ].map((cItem, cIdx) => {
                          if (cItem.divider) {
                            return <div key={cIdx} className="my-1.5 border-t border-slate-800/80" />;
                          }
                          const CIcon = cItem.icon!;
                          return (
                            <button
                              key={cIdx}
                              onClick={cItem.action}
                              className="w-full py-1.5 px-2 rounded-xl hover:bg-slate-800/90 border border-transparent hover:border-slate-700/80 transition-all text-left flex items-center gap-2.5 group"
                            >
                              <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-indigo-600 border border-slate-700/80 group-hover:border-indigo-400 flex items-center justify-center shrink-0 transition-colors shadow-xs">
                                <CIcon className="w-3.5 h-3.5 text-slate-200 group-hover:text-white transition-colors" />
                              </div>
                              <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">{cItem.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                      <img 
                        src={n.actor.avatar} 
                        alt={n.actor.name} 
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                        className="w-7 h-7 rounded-full object-cover shrink-0" 
                      />
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
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-indigo-500/30"
              />
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block mx-0.5" />
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border shadow-2xl p-2 z-50 bg-slate-900 border-slate-800 text-slate-100">
                <div className="p-2.5 border-b border-slate-800 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <span>{user?.name || 'Creator'}</span>
                    {user?.verified && <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">@{user?.username || 'user'}</p>
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
