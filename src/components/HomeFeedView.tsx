import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Bookmark, 
  Share2, 
  Sparkles, 
  Play, 
  Flame, 
  UserPlus, 
  Bot, 
  CheckCircle2, 
  Send,
  MoreHorizontal,
  Volume2,
  Tv,
  Code,
  ShieldCheck,
  TrendingUp,
  Award,
  X,
  MessageSquare,
  Zap,
  PhoneCall,
  Video,
  Globe,
  Brain,
  SlidersHorizontal,
  Compass,
  Filter,
  Layers,
  Copy,
  Check,
  HelpCircle,
  BarChart3,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  Smile,
  Clock,
  Activity,
  Eye,
  Sparkle,
  HardDrive,
  Trash2
} from 'lucide-react';
import { SocialPost, Story, UserProfile } from '../types';
import { StoryViewerModal } from './StoryViewerModal';
import { filterActiveStories } from '../lib/storyUtils';
import { togglePostLikeInDb, createPostComment, subscribeToPostComments } from '../lib/dbService';
import { SavedPostsManager } from './SavedPostsManager';

interface HomeFeedViewProps {
  posts: SocialPost[];
  stories: Story[];
  user: UserProfile;
  isDarkMode: boolean;
  onSelectView: (view: string) => void;
  onOpenCreate: () => void;
  onToggleAiDrawer: () => void;
  isSplashVisible?: boolean;
  onSendDirectMessage?: (recipientUsername: string, recipientName: string, recipientAvatar: string, text: string) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'alert' | 'error') => void;
}

type FeedFilterMode = 'for_you' | 'trending' | 'tech_ai' | 'media' | 'bookmarks';
type AiMoodFilter = 'all' | 'inspiring' | 'tech_code' | 'relaxing' | 'viral_hot';

interface ParticleReaction {
  id: string;
  postId: string;
  emoji: string;
  x: number;
}

// High-Fidelity Skeleton Loading Card with Shimmer Effect
const SkeletonPostCard: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div className={`p-5 rounded-3xl border space-y-4 transition-all ${
    isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
  }`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-slate-700/40 animate-pulse shrink-0" />
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-700/50 rounded-md w-36 animate-pulse" />
          <div className="h-2.5 bg-slate-700/30 rounded-md w-24 animate-pulse" />
        </div>
      </div>
      <div className="w-20 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 animate-pulse" />
    </div>

    <div className="space-y-2.5 pt-1">
      <div className="h-3 bg-slate-700/50 rounded-md w-full animate-pulse" />
      <div className="h-3 bg-slate-700/50 rounded-md w-5/6 animate-pulse" />
      <div className="h-3 bg-slate-700/30 rounded-md w-2/3 animate-pulse" />
    </div>

    <div className="h-44 rounded-2xl bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60 animate-pulse border border-slate-800 flex items-center justify-center">
      <Sparkles className="w-6 h-6 text-indigo-400/40 animate-spin" />
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
      <div className="h-7 w-16 rounded-full bg-slate-700/30 animate-pulse" />
      <div className="h-7 w-16 rounded-full bg-slate-700/30 animate-pulse" />
      <div className="h-7 w-16 rounded-full bg-slate-700/30 animate-pulse" />
      <div className="h-7 w-16 rounded-full bg-slate-700/30 animate-pulse" />
    </div>
  </div>
);

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  posts = [],
  stories = [],
  user,
  isDarkMode,
  onSelectView,
  onOpenCreate,
  onToggleAiDrawer,
  isSplashVisible = false,
  onSendDirectMessage,
  onShowToast
}) => {
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  // Filter non-expired stories (active within 24 hours)
  const activeStories = filterActiveStories(stories);

  // Feed Filter / Mode State
  const [feedMode, setFeedMode] = useState<FeedFilterMode>('for_you');
  const [selectedMood, setSelectedMood] = useState<AiMoodFilter>('all');
  const [isSmartSort, setIsSmartSort] = useState<boolean>(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

  // Carousel refs for horizontal scrollable containers
  const highlightsCarouselRef = useRef<HTMLDivElement>(null);
  const moodFilterRef = useRef<HTMLDivElement>(null);
  const feedTabsRef = useRef<HTMLDivElement>(null);
  const storiesTrayRef = useRef<HTMLDivElement>(null);

  // Bookmarks & Likes
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({
    post_1: true,
    post_code_1: true,
  });
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('munisocial_saved_posts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved posts from localStorage', e);
    }
    return { post_code_1: true };
  });
  const [repostedIds, setRepostedIds] = useState<Record<string, boolean>>({});

  // Custom post reactions count mapping
  const [postReactions, setPostReactions] = useState<Record<string, Record<string, number>>>({});
  const [particles, setParticles] = useState<ParticleReaction[]>([]);

  // AI Explain Post State
  const [aiExplainedPostId, setAiExplainedPostId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, { summary: string; sentiment: string; keyTakeaway: string }>>({});

  // AI Translation State
  const [translatedPostIds, setTranslatedPostIds] = useState<Record<string, string>>({});

  // Comments and Smart Replies
  const [smartReplies, setSmartReplies] = useState<Record<string, string[]>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // AI Community Vibe Bar Toggle
  const [showVibeDigest, setShowVibeDigest] = useState(false);

  // Floating Chat Widget state
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);
  const [quickChatInput, setQuickChatInput] = useState('');
  const [quickChatMessages, setQuickChatMessages] = useState([
    { id: '1', sender: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', text: 'Hey! Loved your latest MuniShort reel! 🔥', time: '10:42 AM' },
    { id: '2', sender: 'MuniAI Copilot', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80', text: 'MuniAI is standing by to help draft responses or generate content.', time: '10:43 AM' }
  ]);

  const quickChatContainerRef = useRef<HTMLDivElement>(null);

  // Virtual List Scroll Position Tracking
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollTop(window.scrollY || document.documentElement.scrollTop);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle feed mode or mood change with smooth simulated skeleton loader
  const handleModeChange = (mode: FeedFilterMode) => {
    if (mode === feedMode) return;
    setIsFilterLoading(true);
    setFeedMode(mode);
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 320);
  };

  const handleMoodChange = (mood: AiMoodFilter) => {
    if (mood === selectedMood) return;
    setIsFilterLoading(true);
    setSelectedMood(mood);
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 320);
  };

  const handleToggleSmartSort = () => {
    const nextState = !isSmartSort;
    setIsSmartSort(nextState);
    if (onShowToast) {
      onShowToast(
        nextState ? 'AI Smart Sort Active ✨' : 'Chronological Sort Selected 🕒',
        nextState ? 'Posts ordered by sentiment score, interaction history & real-time trends.' : 'Posts rendered in linear creation timestamp order.',
        'info'
      );
    }
  };

  // AI 24h Feed Highlights Derived List
  const aiHighlights = useMemo(() => {
    const seen = new Set<string>();
    const uniquePosts: SocialPost[] = [];
    for (const p of (posts || [])) {
      if (p?.id && !seen.has(p.id)) {
        seen.add(p.id);
        uniquePosts.push(p);
      }
    }
    return uniquePosts.slice(0, 5).map((p, idx) => ({
      id: `hl_${p.id}_${idx}`,
      originalPostId: p.id,
      title: idx === 0 
        ? "⚡ Gemini 3.6 Flash Multi-Agent Benchmark" 
        : idx === 1 
        ? "💻 Real-time Reactive Code Execution Engine" 
        : idx === 2 
        ? "🎬 MuniShorts Reels AI Algorithm Breakthrough" 
        : idx === 3
        ? "🚀 Creator Ecosystem 100K Active Milestone"
        : "🧠 Autonomous Code Reviewer Copilot Integration",
      badge: idx === 0 ? "🔥 #1 Top Highlight" : idx === 1 ? "💻 Code Breakout" : idx === 2 ? "🎬 Viral Reel" : "🤖 AI Research",
      author: p.author,
      summary: p.videoDetails?.aiSummary || (p.content ? p.content.slice(0, 85) + "..." : ""),
      keyTakeaway: "Key Takeaway: Gemini 3.6 Flash unlocks instantaneous state updates & 0ms latency code generation.",
      score: p.aiScore || (98 - idx * 2),
      views: p.videoDetails?.views || (14500 + idx * 2800)
    }));
  }, [posts]);

  // Scroll highlights carousel
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!highlightsCarouselRef.current) return;
    const scrollAmount = 300;
    highlightsCarouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Scroll generic horizontal container
  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right', amount = 220) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
  };

  // Vertical Page Scroll Helpers
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Jump smoothly to a post from Highlight Card
  const handleJumpToPost = (postId: string) => {
    setHighlightedPostId(postId);
    const element = document.getElementById(`post-${postId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      if (onShowToast) onShowToast('Post Located 🎯', `Navigating to highlight post #${postId}`, 'info');
    }
    setTimeout(() => setHighlightedPostId(null), 3000);
  };

  // Filtered & Sorted Posts memoized
  const displayedPosts = useMemo(() => {
    let list = [...(posts || [])];

    // 1. Mood Detection Filter
    if (selectedMood === 'inspiring') {
      list = list.filter(p => p && ((p.aiScore && p.aiScore >= 88) || (p.tags || []).some(t => ['future', 'growth', 'community', 'mindset', 'tech', 'ai'].includes(t.toLowerCase()))));
    } else if (selectedMood === 'tech_code') {
      list = list.filter(p => p && (p.type === 'code' || p.aiTopic || (p.tags || []).some(t => ['ai', 'code', 'tech', 'dev', 'software'].includes(t.toLowerCase()))));
    } else if (selectedMood === 'relaxing') {
      list = list.filter(p => p && (p.type === 'short_video' || p.type === 'long_video' || (p.tags || []).some(t => ['music', 'art', 'relax', 'design', 'vfx'].includes(t.toLowerCase()))));
    } else if (selectedMood === 'viral_hot') {
      list = list.filter(p => p && ((p.aiScore || 0) >= 90 || p.likesCount > 200));
    }

    // 2. Feed Mode Filter
    if (feedMode === 'bookmarks') {
      list = list.filter(p => p && bookmarkedPostIds[p.id]);
    } else if (feedMode === 'trending') {
      list.sort((a, b) => ((b?.aiScore || b?.likesCount || 0) - (a?.aiScore || a?.likesCount || 0)));
    } else if (feedMode === 'tech_ai') {
      list = list.filter(p => p && (p.type === 'code' || p.aiTopic || (p.tags || []).some(t => ['ai', 'code', 'tech', 'dev'].includes(t.toLowerCase()))));
    } else if (feedMode === 'media') {
      list = list.filter(p => p && (p.type === 'short_video' || p.type === 'long_video' || (p.mediaUrls && p.mediaUrls.length > 0)));
    }

    // 3. AI Smart Sorting vs Chronological
    if (isSmartSort) {
      list.sort((a, b) => {
        const getAffinityScore = (post: SocialPost) => {
          let score = post.aiScore || 80;
          const matchesInteractionTag = post.tags.some(t => ['ai', 'code', 'tech'].includes(t.toLowerCase()));
          if (matchesInteractionTag) score += 25;
          if (post.author.verified) score += 10;
          if (post.commentsCount > 5) score += 12;
          return score;
        };
        return getAffinityScore(b) - getAffinityScore(a);
      });
    }

    // 4. Unique Deduplication Safeguard
    const seenIds = new Set<string>();
    const uniqueList: SocialPost[] = [];
    for (const item of list) {
      if (item?.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueList.push(item);
      }
    }

    return uniqueList;
  }, [posts, feedMode, selectedMood, isSmartSort, bookmarkedPostIds]);

  // Virtual Window Calculation for 60 FPS scrolling across thousands of posts
  const ITEM_HEIGHT = 440; // Estimated height per post card
  const BUFFER = 3; // Buffer cards rendered above and below window
  const feedTopOffset = 550; // Pixel offset where feed list starts
  const relativeScroll = Math.max(0, scrollTop - feedTopOffset);

  const totalPostCount = displayedPosts.length;
  const rawStartIndex = Math.floor(relativeScroll / ITEM_HEIGHT);
  const visibleStartIndex = Math.max(0, rawStartIndex - BUFFER);
  const visibleEndIndex = Math.min(totalPostCount, Math.ceil((relativeScroll + (typeof window !== 'undefined' ? window.innerHeight : 800)) / ITEM_HEIGHT) + BUFFER);

  const virtualizedPosts = useMemo(() => {
    return displayedPosts.slice(visibleStartIndex, visibleEndIndex);
  }, [displayedPosts, visibleStartIndex, visibleEndIndex]);

  const topSpacerHeight = visibleStartIndex * ITEM_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (totalPostCount - visibleEndIndex) * ITEM_HEIGHT);

  // Auto-close floating quick chat when clicking outside OR after 30 seconds of inactivity
  useEffect(() => {
    if (!isQuickChatOpen) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsQuickChatOpen(false);
      }, 30000);
    };

    resetTimer();

    const handleClickOutside = (event: MouseEvent) => {
      if (quickChatContainerRef.current && !quickChatContainerRef.current.contains(event.target as Node)) {
        setIsQuickChatOpen(false);
      }
    };

    const handleUserActivity = () => {
      resetTimer();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [isQuickChatOpen]);

  const toggleLike = (postId: string) => {
    const isLiked = !!likedPostIds[postId];
    setLikedPostIds(prev => ({ ...prev, [postId]: !isLiked }));
    togglePostLikeInDb(postId, isLiked);
  };

  const toggleBookmark = (postId: string) => {
    const isBookmarked = !bookmarkedPostIds[postId];
    setBookmarkedPostIds(prev => {
      const updated = { ...prev, [postId]: isBookmarked };
      if (!isBookmarked) {
        delete updated[postId];
      }
      try {
        localStorage.setItem('munisocial_saved_posts', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save posts to localStorage', e);
      }
      return updated;
    });
    if (onShowToast) {
      onShowToast(
        isBookmarked ? 'Saved for Later 🔖' : 'Removed from Saved Posts',
        isBookmarked ? 'Post saved to your local storage bookmark collection.' : 'Post removed from your saved collection.',
        'info'
      );
    }
  };

  const clearAllBookmarks = () => {
    setBookmarkedPostIds({});
    try {
      localStorage.setItem('munisocial_saved_posts', '{}');
    } catch (e) {
      console.error('Failed to clear saved posts in localStorage', e);
    }
    if (onShowToast) {
      onShowToast(
        'Saved Posts Cleared 🧹',
        'All bookmarked posts have been removed from local storage.',
        'info'
      );
    }
  };

  const toggleRepost = (postId: string) => {
    const isReposted = !repostedIds[postId];
    setRepostedIds(prev => ({ ...prev, [postId]: isReposted }));
    if (onShowToast) {
      onShowToast(
        isReposted ? 'Reposted to Feed 🔁' : 'Repost Removed',
        isReposted ? 'Shared with your followers on MuniSocial.' : 'Repost undone.',
        'success'
      );
    }
  };

  const handleTriggerReaction = (postId: string, emoji: string) => {
    setPostReactions(prev => {
      const current = prev[postId] || {};
      return {
        ...prev,
        [postId]: {
          ...current,
          [emoji]: (current[emoji] || 0) + 1
        }
      };
    });

    // Particle burst
    const newParticles: ParticleReaction[] = [];
    for (let i = 0; i < 5; i++) {
      newParticles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        postId,
        emoji,
        x: Math.random() * 80 + 10
      });
    }
    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1000);
  };

  const handleExplainPost = (postId: string, content: string) => {
    if (aiExplainedPostId === postId) {
      setAiExplainedPostId(null);
      return;
    }

    if (!aiExplanations[postId]) {
      setAiExplanations(prev => ({
        ...prev,
        [postId]: {
          summary: `This post highlights "${content.slice(0, 70)}..." focusing on innovation and tech collaboration.`,
          sentiment: '⚡ Highly Enthusiastic & Optimistic',
          keyTakeaway: 'Key Takeaway: MuniSocial creators leverage Gemini 3.6 Flash for rapid development & social growth.'
        }
      }));
    }

    setAiExplainedPostId(postId);
  };

  const handleTranslatePost = (postId: string, content: string) => {
    if (translatedPostIds[postId]) {
      setTranslatedPostIds(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      return;
    }

    // Mock translation
    setTranslatedPostIds(prev => ({
      ...prev,
      [postId]: `[Translated by MuniAI] 🌐 ${content}`
    }));

    if (onShowToast) {
      onShowToast('Translated by MuniAI 🌐', 'Rendered in your primary language setting.', 'info');
    }
  };

  const fetchSmartReplies = async (postId: string, postText: string) => {
    try {
      const res = await fetch('/api/ai/smart-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postText, commentContext: 'MuniSocial Feed' })
      });
      const data = await res.json();
      setSmartReplies(prev => ({ ...prev, [postId]: data.replies || [] }));
    } catch (e) {
      setSmartReplies(prev => ({ ...prev, [postId]: ['Great insight! 🔥', 'Love this update on MuniSocial!', 'Thanks for sharing! ✨'] }));
    }
  };

  const handleSendQuickChat = () => {
    if (!quickChatInput.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: user.name,
      avatar: user.avatar,
      text: quickChatInput.trim(),
      time: 'Just now'
    };
    setQuickChatMessages(prev => [...prev, newMsg]);
    setQuickChatInput('');

    setTimeout(() => {
      setQuickChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'MuniAI Assistant',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
          text: `✨ Instant AI Reply: Received "${newMsg.text}". Click 'Messages' in sidebar for full encryption & calls!`,
          time: 'Just now'
        }
      ]);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 relative" role="region" aria-label="Home Feed Section">
      
      {/* Main Feed Column */}
      <main className="lg:col-span-8 space-y-5" role="feed" aria-busy={isFilterLoading}>
        
        {/* DYNAMIC AI MOOD & COMMUNITY VIBE BAR */}
        <div className={`p-4 rounded-3xl border transition-all ${
          isDarkMode 
            ? 'bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-indigo-500/30 text-white' 
            : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 text-slate-950 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-xs sm:text-sm tracking-tight">Community Vibe & Mood</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    High Energy ⚡
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  AI Personalization active • 94% positive ecosystem sentiment today
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowVibeDigest(!showVibeDigest)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              aria-expanded={showVibeDigest}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showVibeDigest ? 'Hide Digest' : 'AI Daily Digest'}</span>
            </button>
          </div>

          {/* Expanded AI Daily Digest Accordion */}
          {showVibeDigest && (
            <div className="mt-3 pt-3 border-t border-indigo-500/20 text-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-indigo-500/20">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Today's Key Highlights:</span>
                  <p className="text-slate-300 mt-0.5">
                    1. Gemini 3.6 Flash microservices deployed by creators.<br />
                    2. MuniShorts video reels seeing a 42% spike in developer tutorials.<br />
                    3. AI Copilot completed 1,200+ instant code reviews in communities.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI FEED HIGHLIGHTS CAROUSEL (LAST 24 HOURS) */}
        <section className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isDarkMode 
            ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/90 border-indigo-500/40 text-white' 
            : 'bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 border-indigo-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400">
                <Sparkles className="w-4 h-4 animate-pulse text-indigo-400" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xs sm:text-sm tracking-tight flex items-center gap-2">
                  <span>AI Feed Highlights</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    24h Digest
                  </span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  AI-summarized breakthrough posts and viral insights across your ecosystem
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => scrollCarousel('left')}
                className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => scrollCarousel('right')}
                className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel cards wrapper */}
          <div 
            ref={highlightsCarouselRef} 
            className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            {aiHighlights.map((hl) => (
              <div 
                key={hl.id} 
                className={`min-w-[260px] sm:min-w-[300px] max-w-[320px] p-3.5 rounded-2xl border flex flex-col justify-between shrink-0 transition-all hover:scale-[1.02] ${
                  isDarkMode 
                    ? 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50' 
                    : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {hl.badge}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <Flame className="w-3 h-3 text-emerald-400" /> {hl.score}% Match
                    </span>
                  </div>

                  <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-2">
                    {hl.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mb-2 line-clamp-2">
                    {hl.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={hl.author.avatar} alt={hl.author.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                      {hl.author.name}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleJumpToPost(hl.originalPostId)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-all flex items-center gap-1 shadow-md"
                  >
                    <span>Jump</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MOOD FILTER & SMART SORT CONTROLS HEADER */}
        <div className={`p-3 sm:p-4 rounded-3xl border transition-all ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Mood Filter Selectors with Scroll Buttons */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <button
                onClick={() => scrollContainer(moodFilterRef, 'left', 180)}
                className="p-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors shrink-0 shadow-sm"
                title="Scroll mood filters left"
                aria-label="Scroll mood filters left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div 
                ref={moodFilterRef}
                onWheel={(e) => {
                  if (e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth py-0.5 cursor-grab active:cursor-grabbing max-w-full flex-1"
              >
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 shrink-0 mr-1 flex items-center gap-1 select-none">
                  <Smile className="w-3.5 h-3.5 text-indigo-400" /> AI Mood:
                </span>
                {[
                  { id: 'all', label: '🌟 All Vibes' },
                  { id: 'inspiring', label: '⚡ Inspiring' },
                  { id: 'tech_code', label: '💻 Tech & Code' },
                  { id: 'relaxing', label: '🧘 Relaxing' },
                  { id: 'viral_hot', label: '🔥 Viral Hot' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleMoodChange(m.id as AiMoodFilter)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 ${
                      selectedMood === m.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => scrollContainer(moodFilterRef, 'right', 180)}
                className="p-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors shrink-0 shadow-sm"
                title="Scroll mood filters right"
                aria-label="Scroll mood filters right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI Smart Sort Toggle */}
            <button
              onClick={handleToggleSmartSort}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
                isSmartSort
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/30 shadow-md shadow-indigo-600/30'
                  : isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isSmartSort ? '✨ Smart Sort: ON' : '🕒 Chronological'}</span>
            </button>
          </div>
        </div>

        {/* FEED MODE / FILTER TABS */}
        <div className={`p-2 rounded-2xl border flex items-center gap-1.5 transition-all relative ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <button
            onClick={() => scrollContainer(feedTabsRef, 'left', 200)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors shrink-0 shadow-sm"
            title="Scroll tabs left"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div 
            ref={feedTabsRef}
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-1 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth cursor-grab active:cursor-grabbing flex-1"
          >
            {[
              { id: 'for_you', label: 'For You (AI)', icon: Sparkles, badge: 'Recommended' },
              { id: 'trending', label: 'Trending', icon: Flame, badge: 'Hot' },
              { id: 'tech_ai', label: 'Tech & Code', icon: Code },
              { id: 'media', label: 'Reels & Media', icon: Tv },
              { id: 'bookmarks', label: 'Saved for Later', icon: Bookmark, count: Object.values(bookmarkedPostIds).filter(Boolean).length }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = feedMode === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleModeChange(tab.id as FeedFilterMode)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-selected={isActive}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollContainer(feedTabsRef, 'right', 200)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors shrink-0 shadow-sm"
            title="Scroll tabs right"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stories Tray */}
        <section className={`p-4 rounded-3xl border transition-all ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-800 text-white' 
            : 'bg-white border-slate-200/90 text-slate-950 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-extrabold text-xs tracking-wider uppercase text-slate-800 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Stories & Moments</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-mono font-bold hidden sm:inline">Real-time • 24h Expire</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollContainer(storiesTrayRef, 'left', 220)}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Scroll stories left"
                  aria-label="Scroll stories left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollContainer(storiesTrayRef, 'right', 220)}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Scroll stories right"
                  aria-label="Scroll stories right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div 
            ref={storiesTrayRef}
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 touch-pan-x scroll-smooth cursor-grab active:cursor-grabbing max-w-full"
          >
            {/* My Story Add */}
            <button 
              onClick={onOpenCreate}
              className="flex flex-col items-center gap-1.5 group shrink-0"
              aria-label="Add a new 24 hour story"
            >
              <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-indigo-500/60 group-hover:border-indigo-400 transition-colors flex items-center justify-center">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                  className="w-14 h-14 rounded-full object-cover" 
                />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-slate-950 text-white text-xs font-bold shadow-md">
                  +
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-slate-300">Add Story</span>
            </button>

            {/* Friend Stories */}
            {activeStories.map((s, idx) => {
              const sampleEmojis = ['🔥', '❤️', '⚡', '🎉'];
              const storyBadgeEmoji = sampleEmojis[idx % sampleEmojis.length];
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStoryId(s.id)}
                  className="flex flex-col items-center gap-1.5 group shrink-0 relative"
                  aria-label={`View story by ${s.author?.name || 'Creator'}`}
                >
                  <div className={`relative p-0.5 rounded-full bg-gradient-to-tr ${
                    s.hasUnseen ? 'from-indigo-500 via-purple-500 to-pink-500 ring-2 ring-indigo-500/30' : 'from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800'
                  } group-hover:scale-105 transition-transform`}>
                    <img 
                      src={s.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"} 
                      alt={s.author?.name || 'Creator'} 
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-950" 
                    />
                    {/* Interactive Animated Reaction Badge Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-[10px] flex items-center justify-center shadow-md group-hover:scale-125 transition-transform group-hover:border-indigo-400">
                      <span className="animate-pulse">{storyBadgeEmoji}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-300 truncate w-16 text-center">
                    {s.author?.name ? s.author.name.split(' ')[0] : 'Creator'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Create Bar Trigger */}
        <div className={`p-4 rounded-3xl border flex items-center gap-3 transition-all ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-800' 
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <img 
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"} 
            alt={user?.name || 'User'} 
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0" 
          />
          <button
            onClick={onOpenCreate}
            className={`flex-1 text-left px-4 py-2.5 rounded-2xl border text-xs transition-colors flex items-center justify-between ${
              isDarkMode 
                ? 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200' 
                : 'bg-slate-100/90 border-slate-200 text-slate-900 hover:text-black font-semibold'
            }`}
          >
            <span>What's on your mind, {user?.name ? user.name.split(' ')[0] : 'Creator'}? Share with MuniAI...</span>
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>
        </div>

        {/* SAVED FOR LATER SECTION */}
        {feedMode === 'bookmarks' ? (
          <SavedPostsManager 
            posts={posts} 
            isDarkMode={isDarkMode} 
            user={user} 
            onBookmarkToggle={toggleBookmark}
            onShowToast={onShowToast}
          />
        ) : isFilterLoading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((i) => (
              <SkeletonPostCard key={i} isDarkMode={isDarkMode} />
            ))}
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className={`p-8 rounded-3xl border text-center space-y-3 ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <Bookmark className="w-10 h-10 mx-auto text-amber-500 animate-bounce" />
            <h3 className="font-bold text-sm text-slate-200">
              {(feedMode as string) === 'bookmarks' ? 'No Saved Posts Yet 🔖' : 'No posts match this mood & filter'}
            </h3>
            <p className="text-xs max-w-sm mx-auto">
              {(feedMode as string) === 'bookmarks' 
                ? "Click 'Save for Later' on any post in your feed to bookmark it to your dedicated local storage collection!" 
                : "Try resetting your mood filter to '🌟 All Vibes' or switching back to 'For You (AI)'."}
            </p>
            <button
              onClick={() => {
                handleMoodChange('all');
                handleModeChange('for_you');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
            >
              {(feedMode as string) === 'bookmarks' ? 'Explore Feed' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Virtualized Top Padding Spacer */}
            {topSpacerHeight > 0 && <div style={{ height: `${topSpacerHeight}px` }} aria-hidden="true" />}

            <div className="space-y-6">
              {(virtualizedPosts || [])?.map((post) => {
                const isLiked = likedPostIds[post.id] || false;
                const isBookmarked = bookmarkedPostIds[post.id] || false;
                const isReposted = repostedIds[post.id] || false;
                const isExplained = aiExplainedPostId === post.id;
                const explanation = aiExplanations[post.id];
                const translatedContent = translatedPostIds[post.id];
                const customReactions = postReactions[post.id] || {};
                const isHighlighted = highlightedPostId === post.id;

                return (
                  <article
                    id={`post-${post.id}`}
                    key={post.id}
                    className={`relative p-4 sm:p-5 rounded-3xl border transition-all duration-300 overflow-hidden ${
                      isHighlighted ? 'ring-4 ring-indigo-500 shadow-2xl scale-[1.01]' : ''
                    } ${
                      isDarkMode 
                        ? 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700/80' 
                        : 'bg-white border-slate-200/90 text-slate-900 shadow-sm hover:border-slate-300'
                    }`}
                  >
                  {/* FLOATING REACTION PARTICLES OVER POST */}
                  {particles.filter(p => p.postId === post.id).map(p => (
                    <div
                      key={p.id}
                      className="absolute bottom-12 pointer-events-none animate-float-up text-2xl drop-shadow-md z-30"
                      style={{ left: `${p.x}%` }}
                    >
                      {p.emoji}
                    </div>
                  ))}

                  {/* Author Row */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name} 
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-indigo-500/20" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                          <span className="text-slate-950 dark:text-white">{post.author.name}</span>
                          {post.author.verified && <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                          {post.author.proBadge && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-500/30 font-bold">
                              PRO
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-400 font-medium">
                          <span>@{post.author.username}</span>
                          <span>•</span>
                          <span>{post.createdAt}</span>
                          {post.aiTopic && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-700 dark:text-indigo-400 font-mono text-[10px] font-bold">{post.aiTopic}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* AI Explain Button */}
                      <button
                        onClick={() => handleExplainPost(post.id, post.content)}
                        className={`p-1.5 rounded-full border text-[10px] font-bold font-mono transition-all flex items-center gap-1 ${
                          isExplained 
                            ? 'bg-purple-600 text-white border-purple-500' 
                            : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        }`}
                        title="AI Summarize & Explain Post"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">AI Explain</span>
                      </button>

                      {post.aiScore && (
                        <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                          <Flame className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> AI Score {post.aiScore}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI EXPLAINED ACCORDION DRAWER */}
                  {isExplained && explanation && (
                    <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 text-xs text-white space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300 flex items-center gap-1.5">
                          <Brain className="w-4 h-4 text-purple-400" /> MuniAI Post Analysis
                        </span>
                        <span className="text-[10px] font-mono text-purple-200 px-2 py-0.5 rounded bg-purple-500/30">
                          {explanation.sentiment}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{explanation.summary}</p>
                      <p className="text-purple-300 font-medium text-[11px] pt-1 border-t border-purple-500/30">
                        {explanation.keyTakeaway}
                      </p>
                    </div>
                  )}

                  {/* Post Body Content */}
                  <div className="text-xs sm:text-sm leading-relaxed mb-4 space-y-3 min-w-0">
                    <p className="whitespace-pre-line break-words [overflow-wrap:anywhere] text-slate-950 dark:text-slate-100 font-normal">
                      {translatedContent || post.content}
                    </p>

                    {/* Translate Button */}
                    <button
                      onClick={() => handleTranslatePost(post.id, post.content)}
                      className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{translatedContent ? 'Show Original' : 'Translate with MuniAI'}</span>
                    </button>

                    {/* Thread Sequence rendered */}
                    {post.type === 'thread' && post.threadSequence && (
                      <div className="space-y-2.5 my-3 pl-3 border-l-2 border-indigo-500/60">
                        {post.threadSequence?.map((item, idx) => (
                          <p key={idx} className={`p-2.5 rounded-xl border text-xs break-words [overflow-wrap:anywhere] ${
                            isDarkMode 
                              ? 'bg-slate-950/50 border-slate-800 text-slate-300' 
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}>
                            {item}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Code Block rendering */}
                    {post.type === 'code' && post.codeDetails && (
                      <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs my-3 text-white shadow-lg">
                        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5 text-emerald-400" /> {post.codeDetails.language}
                          </span>
                          <span className="text-emerald-400 font-semibold">Verified Code Snippet</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-emerald-400 leading-relaxed">
                          <code>{post.codeDetails.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* Poll details */}
                    {post.type === 'poll' && post.pollDetails && (
                      <div className={`p-4 rounded-2xl border space-y-3 my-3 ${
                        isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-300">{post.pollDetails.question}</h4>
                        <div className="space-y-2">
                          {post.pollDetails.options?.map((opt, idx) => {
                            const pct = Math.round((opt.votes / (post.pollDetails?.totalVotes || 1)) * 100);
                            return (
                              <div key={idx} className={`relative overflow-hidden rounded-xl border p-2.5 flex items-center justify-between ${
                                isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                              }`}>
                                <div className="absolute left-0 top-0 bottom-0 bg-indigo-500/20" style={{ width: `${pct}%` }}></div>
                                <span className="relative z-10 font-medium text-xs text-slate-800 dark:text-slate-200">{opt.text}</span>
                                <span className="relative z-10 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-slate-500 text-right">{(post.pollDetails?.totalVotes ?? 0).toLocaleString()} votes</p>
                      </div>
                    )}

                    {/* Media / Video Preview */}
                    {post.mediaUrls && post.mediaUrls.length > 0 && post.type !== 'short_video' && post.type !== 'long_video' && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-3">
                        <img 
                          src={post.mediaUrls[0]} 
                          alt="Post media" 
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"; }}
                          className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    )}

                    {/* Reel or Long Video Card */}
                    {(post.type === 'short_video' || post.type === 'long_video') && post.videoDetails && (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-800 group my-3 bg-slate-950">
                        <img 
                          src={post.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80'} 
                          alt="Video thumbnail" 
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800"; }}
                          className="w-full h-64 sm:h-72 object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-center justify-center">
                          <button 
                            onClick={() => onSelectView(post.type === 'short_video' ? 'shorts' : 'watch')}
                            className="w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 group-hover:scale-110 transition-transform"
                          >
                            <Play className="w-6 h-6 fill-white ml-1" />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                          <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full font-mono text-[10px] border border-slate-700">
                            {post.videoDetails.duration} • {post.videoDetails.quality}
                          </span>
                          <span className="bg-indigo-600/80 backdrop-blur-md px-2.5 py-1 rounded-full font-mono text-[10px]">
                            {(post.videoDetails?.views ?? 0).toLocaleString()} Views
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hashtags Row */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags?.map((t, idx) => (
                      <span key={idx} className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* QUICK REACTION CHIPS ROW */}
                  <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar py-1">
                    {['🔥', '🚀', '🤯', '👏', '💯'].map((emoji) => {
                      const count = customReactions[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleTriggerReaction(post.id, emoji)}
                          className={`px-2 py-0.5 rounded-full text-xs border transition-all flex items-center gap-1 ${
                            count > 0 
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold' 
                              : isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="font-mono text-[10px]">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Post Actions Row */}
                  <div className={`flex items-center justify-between pt-3 border-t text-xs ${
                    isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}>
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 hover:text-pink-500 transition-colors ${isLiked ? 'text-pink-500 font-bold' : ''}`}
                      aria-label="Like post"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                      <span>{(post.likesCount + (isLiked ? 1 : 0)).toLocaleString()}</span>
                    </button>

                    <button 
                      onClick={() => {
                        setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id);
                        if (!smartReplies[post.id]) fetchSmartReplies(post.id, post.content);
                      }}
                      className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors"
                      aria-label="View comments"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount}</span>
                    </button>

                    <button 
                      onClick={() => toggleRepost(post.id)}
                      className={`flex items-center gap-1.5 hover:text-emerald-500 transition-colors ${isReposted ? 'text-emerald-500 font-bold' : ''}`}
                      aria-label="Repost"
                    >
                      <Repeat2 className="w-4 h-4" />
                      <span>{(post.repostsCount + (isReposted ? 1 : 0)).toLocaleString()}</span>
                    </button>

                    <motion.button 
                      whileTap={{ scale: 0.85, rotate: isBookmarked ? -6 : 6 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      onClick={() => toggleBookmark(post.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors font-medium border ${
                        isBookmarked 
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 font-bold shadow-xs ring-1 ring-amber-500/20' 
                          : isDarkMode 
                            ? 'border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30' 
                            : 'border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                      aria-label="Save for Later"
                      title={isBookmarked ? "Stored locally in browser for offline viewing" : "Save post for later offline viewing"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save for Later'}</span>
                      <span className="text-[10px] opacity-80 font-mono">({(post.bookmarksCount + (isBookmarked ? 1 : 0)).toLocaleString()})</span>

                      {/* Local Offline Storage Indicator Badge */}
                      {isBookmarked && (
                        <span 
                          className="flex items-center gap-0.5 text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30"
                          title="Stored locally in browser cache for offline access"
                        >
                          <HardDrive className="w-2.5 h-2.5 text-amber-500" />
                          <span className="font-mono text-[8px] uppercase tracking-wider hidden md:inline">Local</span>
                        </span>
                      )}
                    </motion.button>

                    <button 
                      onClick={() => {
                        if (onShowToast) onShowToast('Post Link Copied! 📋', 'Share with your network.', 'info');
                      }}
                      className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors"
                      aria-label="Share post"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Smart Replies & Comments Drawer */}
                  {activeCommentPostId === post.id && (
                    <div className={`mt-4 pt-4 border-t space-y-3 animate-fade-in ${
                      isDarkMode ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      
                      {/* AI Smart Replies Chips */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> MuniAI Smart Replies
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(smartReplies[post.id] || ['Great post! 🔥', 'Insightful content!', 'Love this update!']).map((r, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCommentInput(r)}
                              className="px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[11px] border border-indigo-500/20 transition-colors"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className={`flex-1 px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                          }`}
                        />
                        <button
                          onClick={() => {
                            if (commentInput.trim()) {
                              if (onShowToast) onShowToast('Comment Published! 💬', commentInput, 'success');
                              setCommentInput('');
                            }
                          }}
                          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Existing Comments */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {post.comments?.map((c) => (
                            <div key={c.id} className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}>
                              <img src={c.author.avatar} alt={c.author.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 font-bold">
                                  <span className="text-slate-900 dark:text-slate-200 truncate">{c.author.name}</span>
                                  <span className="text-[10px] text-slate-500 truncate">@{c.author.username}</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 mt-0.5 break-words [overflow-wrap:anywhere]">{c.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </article>
              );
            })}
            {/* Virtualized Bottom Padding Spacer */}
            {bottomSpacerHeight > 0 && <div style={{ height: `${bottomSpacerHeight}px` }} aria-hidden="true" />}
          </div>
          </div>
        )}

      </main>

      {/* Right Sidebar Widgets Column */}
      <aside className="lg:col-span-4 space-y-6 hidden lg:block">
        
        {/* MuniAI Assistant Widget */}
        <div className={`p-5 rounded-3xl border relative overflow-hidden transition-all ${
          isDarkMode 
            ? 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border-indigo-500/30 text-slate-100' 
            : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-white border-indigo-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm">MuniAI Engine</h3>
              <p className="text-[10px] text-indigo-500 dark:text-indigo-300 font-mono">Gemini 3.6 Flash Active</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Need viral post ideas, video scripts, or code debugging? Ask MuniAI directly!
          </p>
          <button
            onClick={onToggleAiDrawer}
            className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Open AI Copilot
          </button>
        </div>

        {/* Trending Topics */}
        <div className={`p-5 rounded-3xl border transition-all ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Trending Topics
            </h3>
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400">Gemini Grounded</span>
          </div>
          <div className="space-y-3">
            {[
              { tag: '#MuniSocial', posts: '248.9K posts', growth: '+142%' },
              { tag: '#MuniAI', posts: '184.2K posts', growth: '+98%' },
              { tag: '#Gemini3.6', posts: '92.1K posts', growth: '+85%' },
              { tag: '#Cyberpunk2026', posts: '42.0K posts', growth: '+40%' },
            ].map((t, idx) => (
              <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                isDarkMode ? 'bg-slate-950/50 border-slate-800 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 hover:border-indigo-400'
              }`}>
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{t.tag}</span>
                  <span className="text-[10px] text-slate-500 block">{t.posts}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-500 dark:text-emerald-400">{t.growth}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Creators */}
        <div className={`p-5 rounded-3xl border transition-all ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-950 shadow-sm'
        }`}>
          <h3 className="font-heading font-bold text-xs uppercase text-slate-400 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500 dark:text-purple-400" /> Recommended Creators
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Elena Rostova', handle: '@elena_ai', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', bio: 'AI Robotics Engineer' },
              { name: 'Kai Takahashi', handle: '@kaitakahashi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', bio: '3D VFX & Reels' },
            ].map((c, idx) => (
              <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border ${
                isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{c.name}</h4>
                    <span className="text-[10px] text-slate-500">{c.bio}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (onShowToast) onShowToast(`Following ${c.name}! 🎉`, `You will now see updates from ${c.handle} in your feed.`, 'success');
                  }}
                  className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow-md"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* Modern Story Viewer Modal with Progress Bars, Reactions, 24h Expiration Timer & Direct Message Reply */}
      {activeStoryId && activeStories.length > 0 && (
        <StoryViewerModal
          stories={activeStories}
          initialStoryId={activeStoryId}
          onClose={() => setActiveStoryId(null)}
          user={user}
          onSendDirectMessage={onSendDirectMessage}
          onShowToast={onShowToast}
        />
      )}

      {/* FLOATING CHAT WIDGET CONTAINER WITH AUTO-CLOSE REF - HIDE ON LOADING SPLASH */}
      {!isSplashVisible && (
        <div ref={quickChatContainerRef} className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
          {/* FLOATING QUICK CHAT DRAWER / POPOVER */}
          {isQuickChatOpen && (
            <div className="mb-3 w-80 sm:w-96 rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200 bg-slate-950 border-slate-800 text-white">
              {/* Quick Chat Header */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-heading font-bold text-xs">MuniChat Direct</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-white/20 font-mono">Live</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500/30 text-amber-200 border border-amber-400/30 font-mono">Auto 30s</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setIsQuickChatOpen(false);
                      onSelectView('messages');
                    }}
                    className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-[10px] font-bold"
                  >
                    Full Screen
                  </button>
                  <button 
                    onClick={() => setIsQuickChatOpen(false)}
                    className="p-1 rounded-full hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Chat Messages Body */}
              <div className="p-3 space-y-2.5 max-h-64 overflow-y-auto text-xs">
                {quickChatMessages.map((m) => (
                  <div key={m.id} className="flex gap-2 items-start">
                    <img src={m.avatar} alt={m.sender} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                    <div className={`p-2.5 rounded-2xl max-w-[80%] ${
                      m.sender === user.name 
                        ? 'bg-indigo-600 text-white ml-auto' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}>
                      <div className="font-bold text-[10px] opacity-80 mb-0.5">{m.sender}</div>
                      <p>{m.text}</p>
                      <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{m.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Chat Input */}
              <div className="p-2.5 border-t border-slate-800 flex items-center gap-2 bg-slate-900">
                <input 
                  type="text" 
                  placeholder="Type quick message..." 
                  value={quickChatInput}
                  onChange={(e) => setQuickChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendQuickChat()}
                  className="flex-1 px-3 py-1.5 rounded-full border text-xs focus:outline-none focus:border-indigo-500 bg-slate-950 border-slate-800 text-white placeholder-slate-400"
                />
                <button 
                  onClick={handleSendQuickChat}
                  disabled={!quickChatInput.trim()}
                  className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* FLOATING PAGE VERTICAL SCROLL NAVIGATION (JUU / CHINI) & CHAT CONTROLS */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
              <button
                onClick={scrollToTop}
                className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all shadow-md group"
                title="Scroll Juu / Top"
                aria-label="Scroll to top of page"
              >
                <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button
                onClick={scrollToBottom}
                className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all shadow-md group"
                title="Scroll Chini / Bottom"
                aria-label="Scroll to bottom of page"
              >
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* FLOATING CHAT TRIGGER BUTTON */}
            <button
              id="floating-chat-button"
              onClick={() => setIsQuickChatOpen(!isQuickChatOpen)}
              className="p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-2xl shadow-indigo-600/50 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group relative border border-white/20"
              title="Open Quick Chat / Direct Messages"
            >
              <MessageSquare className="w-6 h-6 animate-pulse" />
              <span className="hidden md:inline font-bold text-xs pr-1">Direct Chat</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce shadow-md">
                2
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Floating UP keyframe CSS style for post reactions */}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-180px) scale(1.3);
          }
        }
        .animate-float-up {
          animation: floatUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
};

