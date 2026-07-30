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
import { MuniAICopilotView } from './components/MuniAICopilotView';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { trackNavigation } from './lib/userTracker';
import { triggerHaptic } from './lib/haptics';
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

import { 
  subscribeToRealtimePosts, 
  subscribeToChatMessages, 
  subscribeToNotifications,
  sendChatMessage
} from './lib/dbService';

import { auth, onAuthStateChanged } from './lib/firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('feed');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(7);

  const handleSelectView = (view: ViewMode) => {
    triggerHaptic('selection');
    if (view !== currentView) {
      trackNavigation(currentView, view, CURRENT_USER.name);
      setCurrentView(view);
    }
  };

  const [isDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('munisocial_auth') === 'true';
  });

  // Toast notification system state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'alert' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }].slice(-3));
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Instagram-style boot splash loading screen state
  const [isLoadingSplash, setIsLoadingSplash] = useState<boolean>(true);
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsLoadingSplash(false);
    }, 1800);
    const timer2 = setTimeout(() => {
      setIsSplashVisible(false);
      if (!isAuthenticated) {
        setIsAuthOpen(true);
      }
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isAuthenticated]);

  // Sidebar collapse & mobile menu states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = (userName: string, isSignUp: boolean) => {
    setIsAuthenticated(true);
    localStorage.setItem('munisocial_auth', 'true');
    setIsAuthOpen(false);
    showToast(
      isSignUp ? 'Account Created! 🎉' : 'Welcome Back! 👋',
      `Signed in as ${userName}. Full access granted.`,
      'success'
    );
  };

  // App datasets state
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [analytics, setAnalytics] = useState<CreatorAnalytics>(INITIAL_CREATOR_ANALYTICS);

  // Realtime Firestore Subscriptions
  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('munisocial_auth', 'true');
      }
    });

    // Realtime Posts Listener
    const unsubscribePosts = subscribeToRealtimePosts((realtimePosts) => {
      if (realtimePosts && realtimePosts.length > 0) {
        setPosts(prev => {
          // Merge newly created DB posts while retaining initial structure
          const existingIds = new Set(realtimePosts.map(p => p.id));
          const remainingPrev = prev.filter(p => !existingIds.has(p.id));
          return [...realtimePosts, ...remainingPrev];
        });
      }
    });

    // Realtime Chat Messages Listener
    const unsubscribeChat = subscribeToChatMessages((realtimeMsgs) => {
      if (realtimeMsgs && realtimeMsgs.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(realtimeMsgs.map(m => m.id));
          const remainingPrev = prev.filter(m => !existingIds.has(m.id));
          return [...remainingPrev, ...realtimeMsgs];
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
      unsubscribeChat();
    };
  }, []);

  const handleAddPost = (newPost: SocialPost) => {
    setPosts(prev => [newPost, ...prev]);
    showToast('Post Published! 🚀', 'Your post is live on MuniSocial persistent feed.', 'success');
  };

  const handleAddStory = (newStory: Story) => {
    setStories(prev => [newStory, ...prev]);
    showToast('Story Created! 📸', 'Your 24-hour story is live on MuniSocial.', 'success');
  };

  const handleSendDirectMessage = async (
    recipientUsername: string,
    recipientName: string,
    recipientAvatar: string,
    text: string
  ) => {
    const newMsgText = `@${recipientUsername}: ${text}`;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderAvatar: CURRENT_USER.avatar,
      text: newMsgText,
      timestamp: 'Just now',
    };
    setMessages(prev => [...prev, newMsg]);

    // Send to database
    await sendChatMessage({
      content: newMsgText,
      mediaUrl: null
    });
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
      
      {/* Toast Popup Notification System */}
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />

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
        onSelectView={handleSelectView}
        user={CURRENT_USER}
        isDarkMode={true}
        onToggleTheme={() => {}}
        onOpenCreate={() => setIsCreateOpen(true)}
        onToggleAiDrawer={() => handleSelectView('muniai')}
        isAiDrawerOpen={currentView === 'muniai'}
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
          onSelectView={handleSelectView}
          isDarkMode={isDarkMode}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          unreadMessagesCount={unreadMessagesCount}
        />

        {/* View Component Switcher */}
        <div className="flex-1 w-full min-w-0 py-1 sm:py-2 px-1 sm:px-2">
          {currentView === 'feed' && (
            <HomeFeedView 
              posts={filteredPosts}
              stories={stories}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
              onSelectView={handleSelectView}
              onOpenCreate={() => {
                triggerHaptic('medium');
                setIsCreateOpen(true);
              }}
              onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
              isSplashVisible={isSplashVisible}
              onSendDirectMessage={handleSendDirectMessage}
              onShowToast={showToast}
            />
          )}

          {currentView === 'shorts' && (
            <ShortsFeedView 
              posts={posts}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
              onShowToast={showToast}
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
              onOpenCreate={() => {
                triggerHaptic('medium');
                setIsCreateOpen(true);
              }}
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
              onShowToast={showToast}
              onUnreadCountChange={setUnreadMessagesCount}
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
              onShowToast={showToast}
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
            <MuniAICopilotView 
              currentView={currentView}
              onSelectView={handleSelectView}
              user={CURRENT_USER}
              isDarkMode={isDarkMode}
              onOpenCreate={() => setIsCreateOpen(true)}
              onShowToast={showToast}
            />
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
          onClick={() => handleSelectView('feed')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            currentView === 'feed' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => handleSelectView('shorts')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            currentView === 'shorts' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PlaySquare className="w-5 h-5" />
          <span className="text-[10px]">Reels</span>
        </button>

        <button
          onClick={() => handleSelectView('watch')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            currentView === 'watch' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px]">Watch</span>
        </button>

        <button
          onClick={() => handleSelectView('messages')}
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
        onAddStory={handleAddStory}
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
        canDismiss={isAuthenticated}
        onSuccessAuth={handleAuthSuccess}
      />

    </div>
  );
}

