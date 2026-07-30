import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Bookmark, 
  Share2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown,
  ShieldCheck,
  Disc3,
  X,
  Send,
  Check,
  Bot,
  Play,
  Pause,
  Zap,
  RotateCw,
  Flame,
  Gift,
  Globe,
  Languages,
  SlidersHorizontal,
  Layers,
  Video,
  Mic,
  Music,
  Maximize2,
  Minimize2,
  ListVideo,
  ThumbsUp,
  HelpCircle,
  Plus,
  Minus,
  UploadCloud,
  Wand2,
  BarChart2,
  Sun,
  Award,
  Copy,
  Radio,
  Eye,
  Clock,
  CornerUpRight,
  Activity,
  Filter,
  CheckCircle2,
  Sparkle,
  MessageSquare,
  MoreVertical,
  MoreHorizontal
} from 'lucide-react';
import { SocialPost, UserProfile, PostComment } from '../types';
import { FormattedText } from './FormattedText';
import { triggerHaptic } from '../lib/haptics';

interface ShortsFeedViewProps {
  posts: SocialPost[];
  user: UserProfile;
  isDarkMode: boolean;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'alert' | 'error') => void;
  onOpenCreatePost?: () => void;
}

type CategoryFilter = 'all' | 'trending' | 'tech' | 'ai' | 'music' | 'saved';

interface ReactionParticle {
  id: string;
  emoji: string;
  x: number;
}

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  color: string;
}

const VIRTUAL_GIFTS: GiftItem[] = [
  { id: 'star', name: 'Muni Star', icon: '⭐', cost: 10, color: 'from-amber-400 to-yellow-500' },
  { id: 'gem', name: 'Diamond Gem', icon: '💎', cost: 50, color: 'from-cyan-400 to-blue-500' },
  { id: 'coffee', name: 'Dev Coffee', icon: '☕', cost: 100, color: 'from-orange-400 to-amber-600' },
  { id: 'rocket', name: 'Super Rocket', icon: '🚀', cost: 500, color: 'from-purple-500 to-pink-600' },
];

export const ShortsFeedView: React.FC<ShortsFeedViewProps> = ({
  posts,
  user,
  isDarkMode,
  onShowToast,
  onOpenCreatePost
}) => {
  // Extract posts suited for short reels or generate enhanced short posts if needed
  const shortPosts = useMemo(() => {
    const filtered = posts.filter(
      p => p.type === 'short_video' || p.videoDetails?.aspectRatio === '9:16' || (p.mediaUrls && p.mediaUrls.length > 0)
    );
    
    // Ensure we have rich reel posts with AI capabilities
    if (filtered.length > 0) return filtered;

    // Fallback list enriched
    return posts;
  }, [posts]);

  // Feed Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  
  // Interactive Overlays State
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [creatorTipsMap, setCreatorTipsMap] = useState<Record<string, number>>({});
  const [votedPollsMap, setVotedPollsMap] = useState<Record<string, number>>({});

  const reelPosts = useMemo(() => {
    let list = [...shortPosts];
    if (selectedCategory === 'trending') {
      list.sort((a, b) => (b.videoDetails?.views || b.likesCount) - (a.videoDetails?.views || a.likesCount));
    } else if (selectedCategory === 'tech' || selectedCategory === 'ai') {
      list = list.filter(p => p.type === 'code' || p.aiTopic || p.tags.some(t => ['ai', 'code', 'tech', 'dev'].includes(t.toLowerCase())));
    } else if (selectedCategory === 'saved') {
      list = list.filter(p => bookmarkedMap[p.id]);
    }
    return list.length > 0 ? list : shortPosts;
  }, [shortPosts, selectedCategory, bookmarkedMap]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Player Controls State
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(80);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAutoScroll, setIsAutoScroll] = useState(true); // TikTok auto-scroll feature
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isHoldingSpeed, setIsHoldingSpeed] = useState(false);
  const [showAiCaptions, setShowAiCaptions] = useState(false);
  const [isCleanScreen, setIsCleanScreen] = useState(false);
  const [selectedDubLanguage, setSelectedDubLanguage] = useState<'original' | 'en' | 'es' | 'sw' | 'fr' | 'ja'>('original');

  // Floating Reaction Particles
  const [reactionParticles, setReactionParticles] = useState<ReactionParticle[]>([]);
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ id: string; x: number; y: number } | null>(null);

  // AI Summary Drawer State
  const [activeAiSummaryReel, setActiveAiSummaryReel] = useState<SocialPost | null>(null);

  // Gift Creator Modal State
  const [activeGiftReel, setActiveGiftReel] = useState<SocialPost | null>(null);
  const [selectedGift, setSelectedGift] = useState<GiftItem>(VIRTUAL_GIFTS[0]);

  // Remix / Duet Modal State
  const [activeRemixReel, setActiveRemixReel] = useState<SocialPost | null>(null);
  const [remixMode, setRemixMode] = useState<'duet' | 'stitch' | 'react'>('duet');

  // Comments Drawer State
  const [activeCommentsReel, setActiveCommentsReel] = useState<SocialPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [isRecordingVoiceComment, setIsRecordingVoiceComment] = useState(false);

  // Upload New Short Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMobileCategoryDrawerOpen, setIsMobileCategoryDrawerOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Tech & AI');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isGeneratingAiCaption, setIsGeneratingAiCaption] = useState(false);
  const [aiGeneratedCaption, setAiGeneratedCaption] = useState('');
  const [predictedViralScore, setPredictedViralScore] = useState<number | null>(null);

  // Keyboard Shortcuts Modal State
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Three Dots Menu State for Video Player Overlay
  const [openThreeDotsReelId, setOpenThreeDotsReelId] = useState<string | null>(null);

  // Single Click Play / Pause HUD Feedback
  const [playPauseHud, setPlayPauseHud] = useState<{ id: string; playing: boolean } | null>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle play/pause state with haptics & HUD popup
  const togglePlayPause = (reelId: string) => {
    triggerHaptic('light');
    setIsPlaying(prev => {
      const nextState = !prev;
      setPlayPauseHud({ id: reelId, playing: nextState });
      setTimeout(() => {
        setPlayPauseHud(null);
      }, 900);
      return nextState;
    });
  };

  // Handle touch/click hold for speed
  const handleTouchDown = () => {
    holdTimerRef.current = setTimeout(() => {
      setIsHoldingSpeed(true);
      triggerHaptic('medium');
    }, 450);
  };

  const handleTouchUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHoldingSpeed(false);
  };

  // Handle single touch/click video toggle -> Play / Pause
  const handleVideoCanvasClick = (e: React.MouseEvent, reelId: string) => {
    e.stopPropagation();
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      // Double tap handled by onDoubleClick
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        togglePlayPause(reelId);
      }, 220);
    }
  };

  // Video Timeline Progress Simulator (0 to 100%)
  const [progress, setProgress] = useState(0);

  // Initialize comments map
  useEffect(() => {
    const initialComments: Record<string, PostComment[]> = {};
    reelPosts.forEach(reel => {
      initialComments[reel.id] = reel.comments || [
        {
          id: `c_${reel.id}_1`,
          author: {
            name: 'MuniAI Bot',
            username: 'muni_ai',
            avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
            verified: true
          },
          text: `✨ **AI Key Takeaway**: This short video demonstrates *${reel.videoDetails?.aiSummary || 'high-impact code execution & generative AI workflows on MuniSocial.'}*`,
          createdAt: 'Just now',
          likesCount: 184
        }
      ];
    });
    setCommentsMap(initialComments);
  }, [posts]);

  // Progress Bar Timeline Simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + (100 / (7 * 10)); // 7 second loop
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, activeIndex]);

  // Auto Scroll Timer (TikTok style)
  useEffect(() => {
    if (!isAutoScroll || !isPlaying) return;

    const timer = setInterval(() => {
      setActiveIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % reelPosts.length;
        if (containerRef.current) {
          const height = containerRef.current.clientHeight;
          containerRef.current.scrollTo({
            top: nextIndex * height,
            behavior: 'smooth'
          });
        }
        setProgress(0);
        return nextIndex;
      });
    }, 7000 / playbackSpeed);

    return () => clearInterval(timer);
  }, [isAutoScroll, isPlaying, reelPosts.length, playbackSpeed]);

  // Programmatic smooth scroll to reel index
  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= reelPosts.length || !containerRef.current) return;
    const height = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * height,
      behavior: 'smooth'
    });
    setActiveIndex(index);
    setProgress(0);
  };

  // Handle vertical scroll snapping & index update
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    if (clientHeight > 0) {
      const index = Math.round(scrollTop / clientHeight);
      if (index !== activeIndex && index >= 0 && index < reelPosts.length) {
        setActiveIndex(index);
        setProgress(0);
      }
    }
  };

  // Keyboard Navigation shortcuts (Up, Down, Space, M, K, L, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === ' ' || e.key === 'p') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'm') {
        e.preventDefault();
        setIsMuted(prev => !prev);
      } else if (e.key === 'l') {
        e.preventDefault();
        const currentReel = reelPosts[activeIndex];
        if (currentReel) toggleLike(currentReel.id);
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, reelPosts.length]);

  // Interaction Handlers
  const toggleLike = (reelId: string, event?: React.MouseEvent) => {
    const isNowLiked = !likedMap[reelId];
    setLikedMap(prev => ({ ...prev, [reelId]: isNowLiked }));
    if (isNowLiked) {
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect();
        setDoubleTapHeart({ id: reelId, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      } else {
        setDoubleTapHeart({ id: reelId, x: 200, y: 300 });
      }
      setTimeout(() => setDoubleTapHeart(null), 800);
    }
    if (onShowToast) {
      onShowToast(
        isNowLiked ? 'Liked Reel ❤️' : 'Unliked Reel',
        isNowLiked ? 'Added to your liked MuniShorts list' : 'Removed from liked items',
        'info'
      );
    }
  };

  const toggleBookmark = (reelId: string) => {
    const isNowSaved = !bookmarkedMap[reelId];
    setBookmarkedMap(prev => ({ ...prev, [reelId]: isNowSaved }));
    if (onShowToast) {
      onShowToast(
        isNowSaved ? 'Saved to Bookmarks 🔖' : 'Removed Bookmark',
        isNowSaved ? 'View saved reels in your Saved Shorts filter.' : 'Removed from saved collection.',
        'success'
      );
    }
  };

  const toggleFollow = (authorId: string, authorName: string) => {
    const isNowFollowed = !followedMap[authorId];
    setFollowedMap(prev => ({ ...prev, [authorId]: isNowFollowed }));
    if (onShowToast) {
      onShowToast(
        isNowFollowed ? `Following @${authorName} ✨` : `Unfollowed @${authorName}`,
        isNowFollowed ? 'You will see more short reels from this creator in your AI feed.' : 'Unfollowed creator.',
        'info'
      );
    }
  };

  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>, reelId: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDoubleTapHeart({ id: reelId, x, y });
    setLikedMap(prev => ({ ...prev, [reelId]: true }));
    setTimeout(() => setDoubleTapHeart(null), 800);
  };

  const triggerEmojiRain = (emoji: string) => {
    const newParticles: ReactionParticle[] = [];
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        emoji,
        x: Math.random() * 80 + 10
      });
    }
    setReactionParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setReactionParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);
  };

  const handleSendGift = () => {
    if (!activeGiftReel) return;
    const reelId = activeGiftReel.id;
    setCreatorTipsMap(prev => ({
      ...prev,
      [reelId]: (prev[reelId] || 0) + selectedGift.cost
    }));

    if (onShowToast) {
      onShowToast(
        `Gift Sent! ${selectedGift.icon}`,
        `Sent ${selectedGift.name} (${selectedGift.cost} Coins) to @${activeGiftReel.author.username}!`,
        'success'
      );
    }
    triggerEmojiRain(selectedGift.icon);
    setActiveGiftReel(null);
  };

  const handleVotePoll = (reelId: string, optionIdx: number) => {
    setVotedPollsMap(prev => ({ ...prev, [reelId]: optionIdx }));
    if (onShowToast) {
      onShowToast('Poll Vote Counted! 📊', 'Your response has been recorded on MuniSocial.', 'info');
    }
  };

  const handleGenerateAiCaption = () => {
    setIsGeneratingAiCaption(true);
    setTimeout(() => {
      setAiGeneratedCaption(
        `✨ MuniShorts: ${uploadTitle || 'Building next-gen AI apps'} with #MuniSocial & Gemini 3.6 Flash! Instant code execution, reactive state, and seamless developer workflows. 🚀🔥`
      );
      setPredictedViralScore(96);
      setIsGeneratingAiCaption(false);
      if (onShowToast) {
        onShowToast('AI Caption & Viral Score Ready 🤖', 'Predicted Viral Score: 96/100 (High Engagement Potential)', 'success');
      }
    }, 1200);
  };

  const handlePublishNewShort = () => {
    if (!uploadTitle.trim()) {
      if (onShowToast) onShowToast('Missing Title', 'Please enter a title for your short video.', 'alert');
      return;
    }

    if (onShowToast) {
      onShowToast('Short Reel Published! 🎬', 'Your video is live on MuniShorts feed with AI captions active.', 'success');
    }
    setIsUploadModalOpen(false);
    setUploadTitle('');
    setAiGeneratedCaption('');
    setPredictedViralScore(null);
  };

  const handleAddComment = (reelId: string) => {
    if (!commentText.trim()) return;
    const newComment: PostComment = {
      id: `c_${Date.now()}`,
      author: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        verified: user.verified
      },
      text: commentText.trim(),
      createdAt: 'Just now',
      likesCount: 0
    };

    setCommentsMap(prev => ({
      ...prev,
      [reelId]: [newComment, ...(prev[reelId] || [])]
    }));
    setCommentText('');
    if (onShowToast) {
      onShowToast('Comment Posted', 'Your comment is now live on this reel.', 'success');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-1 sm:py-2 px-1 sm:px-2 h-[calc(100vh-8.5rem)] sm:h-[calc(100vh-5rem)] flex flex-col md:flex-row items-center md:items-stretch justify-center gap-4 relative overflow-hidden select-none">
      
      {/* MAIN VERTICAL SNAP REEL CANVAS (Video Player) */}
      <div className="relative flex-1 w-full max-w-md mx-auto md:mx-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex flex-col h-full min-h-0">
        
        {/* Floating Particle Reactions Stream */}
        {reactionParticles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-20 z-40 pointer-events-none text-3xl animate-float-up drop-shadow-xl"
            style={{ left: `${p.x}%` }}
          >
            {p.emoji}
          </div>
        ))}

        {/* Scrollable Snap Reel Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar select-none"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {reelPosts.map((reel, index) => {
            const isLiked = likedMap[reel.id] || reel.isLiked || false;
            const isBookmarked = bookmarkedMap[reel.id] || false;
            const isFollowed = followedMap[reel.author.id] || false;
            const reelComments = commentsMap[reel.id] || [];
            const tipCoins = creatorTipsMap[reel.id] || 0;
            const votedPollIdx = votedPollsMap[reel.id];

            return (
              <div
                key={reel.id}
                className="w-full h-full snap-start snap-always shrink-0 relative flex flex-col justify-between overflow-hidden"
                onDoubleClick={(e) => handleDoubleTap(e, reel.id)}
                onMouseDown={handleTouchDown}
                onMouseUp={handleTouchUp}
                onTouchStart={handleTouchDown}
                onTouchEnd={handleTouchUp}
              >
                {/* Background Reel Video / Media Player */}
                <div 
                  className="absolute inset-0 z-0 bg-slate-950 cursor-pointer"
                  onClick={(e) => handleVideoCanvasClick(e, reel.id)}
                >
                  {reel.videoUrl || (reel.mediaUrl && (reel.mediaUrl.endsWith('.mp4') || reel.mediaUrl.endsWith('.webm') || reel.mediaUrl.includes('/uploads/video_'))) ? (
                    <video
                      src={reel.videoUrl || reel.mediaUrl}
                      poster={reel.thumbnailUrl || reel.mediaUrls?.[0]}
                      autoPlay={isPlaying && index === activeIndex}
                      loop
                      playsInline
                      muted={isMuted}
                      className={`w-full h-full object-cover transition-transform duration-500 ${isHoldingSpeed ? 'scale-105 filter brightness-110' : ''}`}
                      ref={(el) => {
                        if (el) {
                          el.playbackRate = isHoldingSpeed ? 2.0 : playbackSpeed;
                          if (isPlaying && index === activeIndex) {
                            el.play().catch(() => {});
                          } else {
                            el.pause();
                          }
                        }
                      }}
                    />
                  ) : (
                    <img
                      src={reel.mediaUrls?.[0] || reel.mediaUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80'}
                      alt="Short reel video"
                      className={`w-full h-full object-cover transition-transform duration-500 ${isHoldingSpeed ? 'scale-105 filter brightness-110' : ''}`}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/90 pointer-events-none" />
                  
                  {/* Persistent Paused Play Button Overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center border-2 border-indigo-400 shadow-2xl animate-pulse">
                        <Play className="w-8 h-8 fill-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hold Speed HUD Overlay */}
                {isHoldingSpeed && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 font-bold font-mono text-xs shadow-xl flex items-center gap-1.5 animate-pulse pointer-events-none">
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>2.0x Fast Forwarding</span>
                  </div>
                )}

                {/* Double Tap Floating Heart Animation */}
                {doubleTapHeart?.id === reel.id && (
                  <div
                    className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ping"
                    style={{ left: doubleTapHeart.x, top: doubleTapHeart.y }}
                  >
                    <Heart className="w-24 h-24 text-pink-500 fill-pink-500 drop-shadow-2xl" />
                  </div>
                )}

                {/* Single Click Play / Pause HUD Animation */}
                {playPauseHud?.id === reel.id && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none p-5 rounded-3xl bg-slate-950/85 border border-indigo-500/40 text-white shadow-2xl backdrop-blur-md animate-in zoom-in-75 fade-in duration-200">
                    {playPauseHud.playing ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <Play className="w-12 h-12 text-emerald-400 fill-emerald-400 drop-shadow-lg" />
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-300">Playing</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Pause className="w-12 h-12 text-amber-400 fill-amber-400 drop-shadow-lg" />
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-300">Paused</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Clean Screen Indicator when controls hidden */}
                {isCleanScreen && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-indigo-500/40 text-slate-200 text-[10px] font-mono font-bold flex items-center gap-2 backdrop-blur-md shadow-lg pointer-events-none animate-pulse">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Clean Screen Mode • Click video to restore controls</span>
                  </div>
                )}

                {/* Top Control Overlay */}
                {!isCleanScreen && (
                  <div className="relative z-10 p-3.5 flex items-center justify-between text-white pointer-events-none">
                    
                    {/* Left Badges & Volume Controls (Purple circle) */}
                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      {/* Interactive Volume Buttons (- % +) */}
                      <div className="flex items-center rounded-full bg-slate-900/95 border border-indigo-500/40 p-0.5 shadow-lg text-slate-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newVol = Math.max(0, volume - 10);
                            setVolume(newVol);
                            setIsMuted(newVol === 0);
                          }}
                          className="p-1 hover:text-white hover:bg-slate-800 rounded-full transition-colors active:scale-90"
                          title="Punguza Sauti (-10%)"
                        >
                          <Minus className="w-3.5 h-3.5 text-indigo-300 font-bold" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowVolumeSlider(!showVolumeSlider);
                          }}
                          className="px-1.5 text-[10px] font-mono font-bold hover:text-white flex items-center gap-1"
                          title="Adjust Volume"
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-pink-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                          <span>{isMuted || volume === 0 ? 'Muted' : `${volume}%`}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newVol = Math.min(100, volume + 10);
                            setVolume(newVol);
                            if (isMuted) setIsMuted(false);
                          }}
                          className="p-1 hover:text-white hover:bg-slate-800 rounded-full transition-colors active:scale-90"
                          title="Ongeza Sauti (+10%)"
                        >
                          <Plus className="w-3.5 h-3.5 text-indigo-300 font-bold" />
                        </button>
                      </div>

                      {/* Volume Slider Popover */}
                      {showVolumeSlider && (
                        <>
                          <div 
                            className="fixed inset-0 z-[90] bg-black/10" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowVolumeSlider(false);
                            }} 
                          />
                          <div 
                            className="absolute top-11 left-0 z-[100] p-3 rounded-2xl bg-slate-950/98 border border-indigo-500/50 text-white shadow-2xl backdrop-blur-2xl w-48 animate-in fade-in zoom-in-95 space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 border-b border-slate-800 pb-1">
                              <span>Audio Volume</span>
                              <span className="text-indigo-300 font-extrabold">{isMuted ? 'Muted' : `${volume}%`}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => {
                                  const nextMute = !isMuted;
                                  setIsMuted(nextMute);
                                  if (nextMute) setVolume(0);
                                  else setVolume(80);
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0"
                                title={isMuted ? "Unmute" : "Mute"}
                              >
                                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-pink-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setVolume(val);
                                  setIsMuted(val === 0);
                                }}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* AI Viral Score Badge */}
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white border border-purple-400/50 shadow-sm font-bold">
                        <Flame className="w-3 h-3 text-amber-300 fill-amber-300" /> Viral {reel.aiScore || 95}%
                      </span>

                      {/* Mobile Category & Create Drawer Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMobileCategoryDrawerOpen(true);
                        }}
                        className="md:hidden px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-600/95 hover:bg-indigo-500 border border-indigo-400/60 text-white flex items-center gap-1 shadow-lg active:scale-95 shrink-0"
                        title="Filter Categories & Options"
                      >
                        <Filter className="w-3.5 h-3.5 text-indigo-200" />
                        <span className="capitalize">{selectedCategory === 'all' ? 'For You' : selectedCategory}</span>
                      </button>
                    </div>

                    {/* Right Player Quick Toggles - Three Dots Menu */}
                    <div className="relative z-[100] pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenThreeDotsReelId(openThreeDotsReelId === reel.id ? null : reel.id);
                        }}
                        className={`p-2 rounded-full border transition-all ${
                          openThreeDotsReelId === reel.id 
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                            : 'bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800'
                        }`}
                        title="Playback Settings & Controls"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Backdrop to close three dots menu on click outside */}
                      {openThreeDotsReelId === reel.id && (
                        <div 
                          className="fixed inset-0 z-[90] bg-black/10" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenThreeDotsReelId(null);
                          }} 
                        />
                      )}

                      {/* Three Dots Dropdown Popover (Positioned at right-12 so it NEVER covers red action column) */}
                      {openThreeDotsReelId === reel.id && (
                        <div 
                          className="absolute top-11 right-12 w-56 p-3 rounded-2xl bg-slate-950/98 border border-indigo-500/50 text-white shadow-2xl backdrop-blur-2xl z-[100] animate-in fade-in zoom-in-95 space-y-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-[10px] font-mono font-bold uppercase text-slate-400 px-1 pb-1 border-b border-slate-800 flex items-center justify-between">
                            <span>Video Playback Settings</span>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          </div>

                          {/* Auto Scroll Switch */}
                          <button
                            onClick={() => {
                              const nextState = !isAutoScroll;
                              setIsAutoScroll(nextState);
                              if (onShowToast) {
                                onShowToast(
                                  nextState ? 'Auto Scroll Active ⚡' : 'Auto Scroll Off',
                                  nextState ? 'Reels will auto advance every 7 seconds.' : 'Manual scrolling enabled.',
                                  'info'
                                );
                              }
                            }}
                            className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold flex items-center justify-between transition-colors border border-slate-800"
                          >
                            <span className="flex items-center gap-2">
                              <Zap className={`w-3.5 h-3.5 ${isAutoScroll ? 'text-amber-300' : 'text-slate-400'}`} />
                              <span>Auto Scroll</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isAutoScroll ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                              {isAutoScroll ? 'Auto On' : 'Auto Off'}
                            </span>
                          </button>

                          {/* AI Subtitles CC Toggle */}
                          <button
                            onClick={() => setShowAiCaptions(!showAiCaptions)}
                            className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold flex items-center justify-between transition-colors border border-slate-800"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-1 rounded bg-indigo-500/30 text-indigo-300">CC</span>
                              <span>AI Subtitles</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${showAiCaptions ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                              {showAiCaptions ? 'On' : 'Off'}
                            </span>
                          </button>

                          {/* Clean Screen Mode Toggle */}
                          <button
                            onClick={() => {
                              setIsCleanScreen(!isCleanScreen);
                              if (onShowToast) {
                                onShowToast(
                                  !isCleanScreen ? 'Clean Screen Enabled 👁️' : 'Controls Restored',
                                  !isCleanScreen ? 'All HUD overlays hidden. Click video to restore.' : 'Overlays visible.',
                                  'info'
                                );
                              }
                            }}
                            className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold flex items-center justify-between transition-colors border border-slate-800"
                          >
                            <span className="flex items-center gap-2">
                              <Eye className={`w-3.5 h-3.5 ${isCleanScreen ? 'text-indigo-400' : 'text-slate-400'}`} />
                              <span>Clean Screen</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isCleanScreen ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                              {isCleanScreen ? 'Active' : 'Off'}
                            </span>
                          </button>

                          {/* Playback Speed Toggle */}
                          <button
                            onClick={() => {
                              const speeds = [1, 1.25, 1.5, 2];
                              const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                              const nextSpeed = speeds[nextIdx];
                              setPlaybackSpeed(nextSpeed);
                            }}
                            className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold flex items-center justify-between transition-colors border border-slate-800"
                          >
                            <span className="flex items-center gap-2">
                              <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                              <span>Playback Speed</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {playbackSpeed}x
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* AI LIVE KARAOKE CAPTIONS OVERLAY */}
                {!isCleanScreen && showAiCaptions && (
                  <div className="absolute bottom-36 left-4 right-16 z-20 pointer-events-none">
                    <div className="inline-block p-2.5 px-3.5 rounded-2xl bg-slate-950/90 border border-indigo-500/40 text-white backdrop-blur-md shadow-2xl max-w-xs">
                      <div className="text-[9px] font-mono text-indigo-400 mb-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> MuniAI Live Subtitles
                      </div>
                      <span className="text-xs font-bold tracking-wide text-indigo-100 leading-relaxed font-sans block">
                        "✨ {reel.content.slice(0, 90)}..."
                      </span>
                    </div>
                  </div>
                )}

                {/* INTERACTIVE POLL STICKER (If post has poll or generated poll) */}
                {!isCleanScreen && reel.pollDetails && (
                  <div className="absolute bottom-40 left-4 right-16 z-20 p-3 rounded-2xl bg-slate-950/85 border border-indigo-500/30 backdrop-blur-md text-white space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" /> Creator Interactive Poll
                    </span>
                    <p className="text-xs font-bold">{reel.pollDetails.question}</p>
                    <div className="space-y-1.5">
                      {reel.pollDetails.options.map((opt, optIdx) => {
                        const isVoted = votedPollIdx === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleVotePoll(reel.id, optIdx)}
                            className={`w-full text-left p-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                              isVoted 
                                ? 'bg-indigo-600 border-indigo-400 text-white font-bold' 
                                : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isVoted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BOTTOM OVERLAY INFO & RIGHT ACTION COLUMN */}
                {!isCleanScreen && (
                  <div className="relative z-10 p-4 flex items-end justify-between gap-3 text-white">
                  
                  {/* Left Column: Creator Profile & Description */}
                  <div className="flex-1 min-w-0 space-y-2">
                    
                    {/* Creator Row */}
                    <div className="flex items-center gap-2">
                      <img
                        src={reel.author.avatar}
                        alt={reel.author.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm truncate">
                          <span className="truncate">@{reel.author.username}</span>
                          {reel.author.verified && <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-300">
                          {(reel.videoDetails?.views || 14200).toLocaleString()} views • {reel.createdAt}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollow(reel.author.id, reel.author.username);
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-md transition-all shrink-0 ${
                          isFollowed 
                            ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                        }`}
                      >
                        {isFollowed ? 'Following' : '+ Follow'}
                      </button>
                    </div>

                    {/* Reel Caption */}
                    <FormattedText
                      text={reel.content}
                      className="text-xs line-clamp-2 text-slate-200 leading-relaxed font-sans"
                    />

                    {/* Tags */}
                    {reel.tags && reel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reel.tags.slice(0, 3).map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] text-indigo-300 font-mono font-semibold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Audio Track & AI Dub Switch */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-200 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-full">
                        <Disc3 className="w-3 h-3 text-indigo-400 animate-spin shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {reel.videoDetails?.audioTrack || 'Original Sound - MuniSynth'}
                        </span>
                      </div>

                      {/* AI Summary Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAiSummaryReel(reel);
                        }}
                        className="px-2.5 py-1 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Sparkles className="w-3 h-3 text-purple-300" />
                        <span>AI Summary</span>
                      </button>
                    </div>

                    {/* Tip Counter if creator tipped */}
                    {tipCoins > 0 && (
                      <div className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        <span>Support: {tipCoins} Coins Tipped!</span>
                      </div>
                    )}

                  </div>

                  {/* Right Vertical Action Bar */}
                  <div className="flex flex-col items-center gap-3 shrink-0 pointer-events-auto z-20">
                    
                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(reel.id, e);
                      }}
                      className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
                    >
                      <div className={`p-3 rounded-full border transition-all ${
                        isLiked 
                          ? 'bg-pink-600 border-pink-400 text-white scale-110 shadow-lg shadow-pink-600/40' 
                          : 'bg-slate-900/80 border-slate-700 text-white group-hover:bg-slate-800'
                      }`}>
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                      </div>
                      <span className="text-[10px] font-bold">
                        {(reel.likesCount + (isLiked ? 1 : 0)).toLocaleString()}
                      </span>
                    </button>

                    {/* Comment Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCommentsReel(reel);
                      }}
                      className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
                    >
                      <div className="p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white group-hover:bg-slate-800 transition-all">
                        <MessageCircle className="w-5 h-5 text-slate-200" />
                      </div>
                      <span className="text-[10px] font-bold">
                        {reelComments.length}
                      </span>
                    </button>

                    {/* Tip / Gift Creator Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveGiftReel(reel);
                      }}
                      className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
                    >
                      <div className="p-3 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 border border-amber-300 text-slate-950 font-bold group-hover:scale-105 transition-all shadow-md shadow-amber-500/20">
                        <Gift className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-300">Tip</span>
                    </button>

                    {/* Remix / Duet Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRemixReel(reel);
                      }}
                      className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
                    >
                      <div className="p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white group-hover:bg-slate-800 transition-all">
                        <Repeat2 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <span className="text-[10px] font-bold">Remix</span>
                    </button>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(reel.id);
                      }}
                      className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
                    >
                      <div className={`p-3 rounded-full border transition-all ${
                        isBookmarked 
                          ? 'bg-amber-600 border-amber-400 text-white scale-110 shadow-lg' 
                          : 'bg-slate-900/80 border-slate-700 text-white group-hover:bg-slate-800'
                      }`}>
                        <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-white' : ''}`} />
                      </div>
                      <span className="text-[10px] font-bold">Save</span>
                    </button>

                  </div>

                </div>
                )}

                {/* TIMELINE PROGRESS BAR AT BOTTOM */}
                <div className="relative w-full h-1 bg-slate-800 z-20">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT SIDE DISCOVERY & CONTROL PANEL (Desktop Only) */}
      <div className="hidden md:flex w-80 shrink-0 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 text-white flex-col justify-between gap-4 shadow-xl backdrop-blur-md h-full overflow-y-auto no-scrollbar">
        {/* Header & Brand */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-0.5 shadow-md flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                  MuniShorts
                </h2>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">AI Reels Feed</span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(true)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Create Short Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full py-2.5 px-4 mb-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Short</span>
          </button>

          {/* Category Navigation Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 px-1">Discover Categories</span>
            {[
              { id: 'all', label: 'For You', icon: Sparkles, desc: 'AI personalized reels' },
              { id: 'trending', label: 'Trending', icon: Flame, desc: 'Top viral shorts' },
              { id: 'tech', label: 'Tech & Code', icon: Bot, desc: 'AI, web & dev shorts' },
              { id: 'saved', label: 'Saved', icon: Bookmark, desc: 'Bookmarked reels' }
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
                  className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40' 
                      : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <div>{cat.label}</div>
                      <div className="text-[10px] font-normal text-slate-400">{cat.desc}</div>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Stats / Auto Scroll Indicator */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500">Auto Scroll</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isAutoScroll ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              {isAutoScroll ? '⚡ Active' : 'Off'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
            <span>Active Reel</span>
            <span className="font-mono text-indigo-400">{activeIndex + 1} / {reelPosts.length}</span>
          </div>
        </div>
      </div>

      {/* AI SUMMARY GLASS DRAWER */}
      {activeAiSummaryReel && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-2 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white space-y-4 max-h-[80%] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-heading font-extrabold text-sm">MuniAI Video Insights</h3>
              </div>
              <button
                onClick={() => setActiveAiSummaryReel(null)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 space-y-1">
                <span className="font-bold text-indigo-300">Executive Summary:</span>
                <p className="text-slate-300 leading-relaxed">
                  "{activeAiSummaryReel.content}"
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-200">Key Chapter Moments:</span>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-emerald-400">0:00 - 0:15</span>
                    <span className="text-slate-300">Core Architecture & Demo</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-emerald-400">0:15 - 0:45</span>
                    <span className="text-slate-300">Gemini 3.6 Flash Performance Benchmarks</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-emerald-400">0:45 - 1:00</span>
                    <span className="text-slate-300">Live Code Execution & Wrap Up</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Content Safety: Verified Safe 🛡️</span>
                <span>Copyright: Original Creator</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GIFT / TIP CREATOR MODAL */}
      {activeGiftReel && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-2 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-extrabold text-sm">Send Virtual Gift to @{activeGiftReel.author.username}</h3>
              </div>
              <button
                onClick={() => setActiveGiftReel(null)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {VIRTUAL_GIFTS.map((g) => {
                const isSelected = selectedGift.id === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGift(g)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <div>
                      <div className="font-bold text-xs">{g.name}</div>
                      <div className="text-[10px] text-amber-400 font-mono font-semibold">{g.cost} MuniCoins</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSendGift}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4 fill-slate-950" />
              <span>Send {selectedGift.name} ({selectedGift.cost} Coins)</span>
            </button>
          </div>
        </div>
      )}

      {/* REMIX / DUET MODAL */}
      {activeRemixReel && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-2 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Repeat2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-heading font-extrabold text-sm">Remix Reel with @{activeRemixReel.author.username}</h3>
              </div>
              <button
                onClick={() => setActiveRemixReel(null)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'duet', label: 'Duet (Side-by-Side)', icon: Layers },
                { id: 'stitch', label: 'Stitch (Cut 5s)', icon: Repeat2 },
                { id: 'react', label: 'Reaction Bubble', icon: Video }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = remixMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setRemixMode(m.id as any)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-400 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (onShowToast) {
                  onShowToast('Studio Recording Launched 🎥', `Prepared ${remixMode.toUpperCase()} mode studio session.`, 'success');
                }
                setActiveRemixReel(null);
              }}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Launch Studio Camera ({remixMode.toUpperCase()})</span>
            </button>
          </div>
        </div>
      )}

      {/* COMMENTS SLIDE-UP DRAWER */}
      {activeCommentsReel && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end rounded-3xl overflow-hidden animate-in fade-in duration-200">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 flex flex-col max-h-[85%] text-white space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                <span className="font-heading font-bold text-sm">
                  Comments ({(commentsMap[activeCommentsReel.id] || []).length})
                </span>
              </div>
              <button
                onClick={() => setActiveCommentsReel(null)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
              {(commentsMap[activeCommentsReel.id] || []).map((c) => (
                <div key={c.id} className="flex gap-2.5 text-xs p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <img src={c.author.avatar} alt={c.author.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 font-bold text-slate-200">
                      <span>@{c.author.username}</span>
                      {c.author.verified && <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 inline" />}
                      <span className="text-[10px] text-slate-500 font-normal ml-auto">{c.createdAt}</span>
                    </div>
                    <FormattedText text={c.text} className="text-slate-300 mt-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Input & Quick Replies */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(activeCommentsReel.id)}
                  placeholder="Add a comment (*bold*, _italic_, `code`)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleAddComment(activeCommentsReel.id)}
                  disabled={!commentText.trim()}
                  className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[10px] text-slate-400 font-mono shrink-0">Quick Reply:</span>
                {['🔥 *Epic short!*', 'Awesome _visual effects!_ ✨', 'Super clean code! 🚀'].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCommentText(q)}
                    className="px-2.5 py-1 rounded-full text-[10px] bg-slate-800 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500 text-slate-300 shrink-0 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* UPLOAD / CREATE SHORT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                <h3 className="font-heading font-extrabold text-base">Create & Publish MuniShort</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* File Dropzone */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 text-center space-y-2 cursor-pointer transition-colors">
                <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="font-bold text-slate-200">Drag & Drop short video file (MP4, MOV)</p>
                <p className="text-[10px] text-slate-500">Up to 60 seconds • 9:16 Vertical Portrait recommended</p>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Short Video Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Building Gemini 3.6 Flash microservices in 30 seconds"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* AI Auto Caption Button */}
              <button
                onClick={handleGenerateAiCaption}
                disabled={isGeneratingAiCaption}
                className="w-full py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                <span>{isGeneratingAiCaption ? 'Generating AI Captions...' : 'Auto-Generate AI Caption & Viral Score'}</span>
              </button>

              {aiGeneratedCaption && (
                <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                    <span>Generated Caption:</span>
                    {predictedViralScore && (
                      <span className="text-amber-400 font-mono">Predicted Viral Score: {predictedViralScore}/100 🚀</span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{aiGeneratedCaption}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishNewShort}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30"
              >
                Publish Short Reel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-heading font-extrabold text-sm">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Next / Previous Video</span>
                <span className="text-indigo-400 font-bold">↓ / ↑ or J / K</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Play / Pause</span>
                <span className="text-indigo-400 font-bold">Space / P</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Mute / Unmute</span>
                <span className="text-indigo-400 font-bold">M</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Like Video</span>
                <span className="text-indigo-400 font-bold">L</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE CATEGORIES & CREATOR DRAWER SHEET */}
      {isMobileCategoryDrawerOpen && (
        <div 
          className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex flex-col justify-end md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileCategoryDrawerOpen(false)}
        >
          <div 
            className="bg-slate-900 border-t border-indigo-500/40 rounded-t-3xl p-5 text-white space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-0.5 shadow-md flex items-center justify-center">
                  <Video className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                    MuniShorts Categories
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">Select Feed & Actions</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileCategoryDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create Short Button */}
            <button
              onClick={() => {
                setIsMobileCategoryDrawerOpen(false);
                setIsUploadModalOpen(true);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Short</span>
            </button>

            {/* Categories */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 px-1">Discover Categories</span>
              {[
                { id: 'all', label: 'For You', icon: Sparkles, desc: 'AI personalized reels' },
                { id: 'trending', label: 'Trending', icon: Flame, desc: 'Top viral shorts' },
                { id: 'tech', label: 'Tech & Code', icon: Bot, desc: 'AI, web & dev shorts' },
                { id: 'saved', label: 'Saved', icon: Bookmark, desc: 'Bookmarked reels' }
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id as CategoryFilter);
                      setIsMobileCategoryDrawerOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400/40' 
                        : 'bg-slate-950/80 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <div className="text-sm font-bold">{cat.label}</div>
                        <div className="text-[11px] font-normal text-slate-400">{cat.desc}</div>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Auto scroll setting quick switch */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-400">Auto Scroll Reels</span>
              <button
                onClick={() => setIsAutoScroll(!isAutoScroll)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  isAutoScroll ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isAutoScroll ? '⚡ Active' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
