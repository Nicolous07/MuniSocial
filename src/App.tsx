import React, { useState, useEffect } from 'react';
import muniLogo from './assets/images/munisocial_logo_1785063397683.jpg';
import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { HomeFeedView } from './components/HomeFeedView';
import { ShortsFeedView } from './components/ShortsFeedView';
import { WatchVideoView } from './components/WatchVideoView';
import { ThreadsView } from './components/ThreadsView';
import { CommunitiesView } from './components/CommunitiesView';
import { MarketplaceView } from './components/MarketplaceView';
import { CreatorStudioView } from './components/CreatorStudioView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { CreatePostModal } from './components/CreatePostModal';
import { MuniAIAssistantDrawer } from './components/MuniAIAssistantDrawer';
import { AuthModal } from './components/AuthModal';
import { 
  Home, 
  PlaySquare, 
  Tv, 
  MessageCircle, 
  Menu,
  Sparkles,
  Bot
} from 'lucide-react';

import { 
  ViewMode, 
  SocialPost, 
  Story, 
  Community, 
  MarketplaceItem, 
  ChatMessage, 
  NotificationItem, 
  CreatorAnalytics 
} from './types';

import { 
  CURRENT_USER, 
  INITIAL_POSTS, 
  INITIAL_STORIES, 
  INITIAL_COMMUNITIES, 
  INITIAL_MARKETPLACE, 
  INITIAL_MESSAGES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_CREATOR_ANALYTICS 
} from './mock/data';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('feed');
  const [isDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initial Instagram-style boot splash loading screen state
  const [isLoadingSplash, setIsLoadingSplash] = useState<boolean>(true);
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsLoadingSplash(false);
    }, 1800);
    const timer2 = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Sidebar collapse & mobile menu states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // App datasets state
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [analytics, setAnalytics] = useState<CreatorAnalytics>(INITIAL_CREATOR_ANALYTICS);

  const handleAddPost = (newPost: SocialPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const filteredPosts = posts.filter(p => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.content.toLowerCase().includes(query) ||
      p.author.name.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200 pb-16 md:pb-0 bg-slate-950 text-slate-100 relative">
      
      {/* INSTAGRAM-STYLE APP BOOT SPLASH SCREEN */}
      {isSplashVisible && (
        <div className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between py-12 transition-opacity duration-500 select-none ${
          isLoadingSplash ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Top spacer */}
          <div className="w-full"></div>

          {/* Center Logo & Animated Pulse */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 shadow-2xl shadow-indigo-500/40 animate-pulse">
              <img 
                src={muniLogo} 
                alt="MuniSocial Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-[22px] object-cover shadow-inner" 
              />
              <div className="absolute -inset-3 bg-indigo-500/20 rounded-3xl blur-2xl -z-10 animate-ping opacity-40"></div>
            </div>
            <div className="text-center">
              <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                MuniSocial
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-widest mt-1">
                CONNECT. CREATE. INSPIRE.
              </p>
            </div>
          </div>

          {/* Bottom Brand Tag (Instagram style 'from MUNICRYPTRIX AI') */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">from</span>
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span className="tracking-wider text-indigo-300 font-mono">MUNICRYPTRIX AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <Header 
        currentView={currentView}
        onSelectView={setCurrentView}
        user={CURRENT_USER}
        isDarkMode={true}
        onToggleTheme={() => {}}
        onOpenCreate={() => setIsCreateOpen(true)}
        onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        isAiDrawerOpen={isAiDrawerOpen}
        notifications={notifications}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main App Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex items-start min-h-[calc(100vh-3.5rem)]">
        
        {/* Left Navigation Sidebar with Collapse/Open Support */}
        <SidebarNav 
          currentView={currentView}
          onSelectView={setCurrentView}
          isDarkMode={isDarkMode}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* View Component Switcher */}
        <div className="flex-1 w-full min-w-0 py-1 sm:py-2 px-1 sm:px-2">
          {currentView === 'feed' && (
            <HomeFeedView 
              posts={filteredPosts}
              stories={stories}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
              onSelectView={setCurrentView}
              onOpenCreate={() => setIsCreateOpen(true)}
              onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            />
          )}

          {currentView === 'shorts' && (
            <ShortsFeedView 
              posts={posts}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
            />
          )}

          {currentView === 'watch' && (
            <WatchVideoView 
              posts={posts}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
            />
          )}

          {currentView === 'threads' && (
            <ThreadsView 
              posts={posts}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
              onOpenCreate={() => setIsCreateOpen(true)}
            />
          )}

          {currentView === 'communities' && (
            <CommunitiesView 
              communities={communities}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
            />
          )}

          {currentView === 'marketplace' && (
            <MarketplaceView 
              items={marketplace}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
            />
          )}

          {currentView === 'messages' && (
            <MessagesView 
              initialMessages={messages}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
            />
          )}

          {currentView === 'creator-studio' && (
            <CreatorStudioView 
              analytics={analytics}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
            />
          )}

          {currentView === 'admin' && (
            <AdminDashboardView 
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView 
              user={CURRENT_USER}
              posts={posts}
              isDarkMode={isDarkMode}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {currentView === 'muniai' && (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
              <div className={`p-6 sm:p-8 rounded-3xl border ${
                isDarkMode 
                  ? 'border-indigo-500/40 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 text-white' 
                  : 'border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-white text-slate-900 shadow-sm'
              } space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-xl sm:text-2xl">MuniAI Full Assistant Mode</h2>
                    <p className="text-xs text-indigo-600 dark:text-indigo-300 font-mono">Server-side Gemini 3.6 Flash Integration</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  MuniAI powers real-time chat, video chapter summarization, smart reply recommendations, and post drafting on MuniSocial. Click the "MuniAI" button in the top bar anytime to slide out the real-time assistant drawer!
                </p>
                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/40"
                >
                  Open MuniAI Copilot Drawer
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className={`fixed bottom-0 left-0 right-0 z-30 md:hidden border-t backdrop-blur-xl px-2 py-1.5 flex items-center justify-around ${
        isDarkMode 
          ? 'bg-slate-950/95 border-slate-800/80 text-slate-400' 
          : 'bg-white/95 border-slate-200 text-slate-600 shadow-lg'
      }`}>
        <button
          onClick={() => setCurrentView('feed')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            currentView === 'feed' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setCurrentView('shorts')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            currentView === 'shorts' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PlaySquare className="w-5 h-5" />
          <span className="text-[10px]">Reels</span>
        </button>

        <button
          onClick={() => setCurrentView('watch')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            currentView === 'watch' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px]">Watch</span>
        </button>

        <button
          onClick={() => setCurrentView('messages')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all relative ${
            currentView === 'messages' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">Chat</span>
          <span className="absolute top-0 right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 p-1 rounded-xl hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <Menu className="w-5 h-5 text-indigo-500" />
          <span className="text-[10px] font-bold text-indigo-500">Menu</span>
        </button>
      </nav>

      {/* Global Modals */}
      <CreatePostModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAddPost={handleAddPost}
        user={CURRENT_USER}
        isDarkMode={isDarkMode}
      />

      <MuniAIAssistantDrawer 
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        isDarkMode={isDarkMode}
        onApplyGeneratedContent={(txt) => {
          setIsAiDrawerOpen(false);
          setIsCreateOpen(true);
        }}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
