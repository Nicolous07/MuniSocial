import React, { useState, useRef, useEffect } from 'react';
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
  RotateCw
} from 'lucide-react';
import { SocialPost, UserProfile, PostComment } from '../types';
import { FormattedText } from './FormattedText';

interface ShortsFeedViewProps {
  posts: SocialPost[];
  user: UserProfile;
  isDarkMode: boolean;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'alert' | 'error') => void;
}

export const ShortsFeedView: React.FC<ShortsFeedViewProps> = ({
  posts,
  user,
  isDarkMode,
  onShowToast
}) => {
  // Extract posts suited for short reels
  const shortPosts = posts.filter(p => p.type === 'short_video' || p.videoDetails?.aspectRatio === '9:16' || (p.mediaUrls && p.mediaUrls.length > 0));
  const reelPosts = shortPosts.length > 0 ? shortPosts : posts;

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAutoScroll, setIsAutoScroll] = useState(true); // TikTok auto-scroll feature!
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [showAiCaptions, setShowAiCaptions] = useState(true);

  // Comments drawer modal state
  const [activeCommentsReel, setActiveCommentsReel] = useState<SocialPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ id: string; x: number; y: number } | null>(null);

  // Initialize comments from post
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
          text: `✨ AI Insight: This reel highlights *${reel.videoDetails?.aiSummary || 'high engagement visual design on MuniSocial.'}*`,
          createdAt: 'Just now',
          likesCount: 124
        }
      ];
    });
    setCommentsMap(initialComments);
  }, [posts]);

  // Programmatic smooth scroll to reel index
  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= reelPosts.length || !containerRef.current) return;
    const height = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * height,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  // TikTok-style Auto Scroll Timer (scrolls every 7 seconds if isAutoScroll and isPlaying are true)
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
        return nextIndex;
      });
    }, 7000);

    return () => clearInterval(timer);
  }, [isAutoScroll, isPlaying, reelPosts.length]);

  // Handle vertical scroll snapping & index update
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    if (clientHeight > 0) {
      const index = Math.round(scrollTop / clientHeight);
      if (index !== activeIndex && index >= 0 && index < reelPosts.length) {
        setActiveIndex(index);
      }
    }
  };

  // Keyboard navigation (ArrowUp & ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, reelPosts.length]);

  const toggleLike = (reelId: string) => {
    const isNowLiked = !likedMap[reelId];
    setLikedMap(prev => ({ ...prev, [reelId]: isNowLiked }));
    if (onShowToast) {
      onShowToast(isNowLiked ? 'Liked Reel ❤️' : 'Unliked Reel', isNowLiked ? 'Added to your liked MuniShorts' : 'Removed from liked items', 'info');
    }
  };

  const toggleBookmark = (reelId: string) => {
    const isNowSaved = !bookmarkedMap[reelId];
    setBookmarkedMap(prev => ({ ...prev, [reelId]: isNowSaved }));
    if (onShowToast) {
      onShowToast(isNowSaved ? 'Saved Reel 🔖' : 'Removed Bookmark', isNowSaved ? 'Saved to your library' : 'Removed from bookmarks', 'success');
    }
  };

  const toggleFollow = (authorId: string, authorName: string) => {
    const isNowFollowed = !followedMap[authorId];
    setFollowedMap(prev => ({ ...prev, [authorId]: isNowFollowed }));
    if (onShowToast) {
      onShowToast(isNowFollowed ? `Followed @${authorName}` : `Unfollowed @${authorName}`, isNowFollowed ? 'You will see more reels from this creator' : 'Unfollowed creator', 'info');
    }
  };

  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>, reelId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDoubleTapHeart({ id: reelId, x, y });
    setLikedMap(prev => ({ ...prev, [reelId]: true }));
    setTimeout(() => setDoubleTapHeart(null), 800);
    if (onShowToast) {
      onShowToast('Liked Reel ❤️', 'Double tap heart like applied', 'info');
    }
  };

  const handleShare = (reel: SocialPost) => {
    navigator.clipboard?.writeText?.(window.location.href);
    if (onShowToast) {
      onShowToast('Link Copied 🔗', 'MuniShort reel link copied to clipboard', 'success');
    }
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
      onShowToast('Comment Posted', 'Your comment is now live on this reel', 'success');
    }
  };

  return (
    <div className="max-w-md mx-auto py-2 px-2 h-[calc(100vh-5.5rem)] flex items-center justify-center relative">
      
      {/* Main Snap Scroll Container */}
      <div className="relative w-full h-full max-h-[780px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
        
        {/* Scrollable Container with Native Scroll Snap */}
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

            return (
              <div 
                key={reel.id}
                className="w-full h-full snap-start snap-always shrink-0 relative flex flex-col justify-between overflow-hidden"
                onDoubleClick={(e) => handleDoubleTap(e, reel.id)}
              >
                {/* Background Image / Reel Video Cover */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={reel.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80'} 
                    alt="Short reel video" 
                    className="w-full h-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/90"></div>
                </div>

                {/* Double Tap Floating Heart Animation */}
                {doubleTapHeart?.id === reel.id && (
                  <div 
                    className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ping"
                    style={{ left: doubleTapHeart.x, top: doubleTapHeart.y }}
                  >
                    <Heart className="w-20 h-20 text-pink-500 fill-pink-500 drop-shadow-2xl" />
                  </div>
                )}

                {/* Top Header Bar Controls */}
                <div className="relative z-10 p-3.5 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-extrabold text-sm tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-200 to-pink-400 bg-clip-text text-transparent">
                      MuniReels
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-600/80 rounded-full border border-indigo-400/60 shadow-sm">
                      {index + 1} / {reelPosts.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Auto Scroll Toggle Switch */}
                    <button
                      onClick={() => {
                        const newState = !isAutoScroll;
                        setIsAutoScroll(newState);
                        if (onShowToast) onShowToast(newState ? 'Auto Scroll Enabled ⚡' : 'Auto Scroll Disabled', newState ? 'Reels will automatically advance every 7 seconds' : 'Manual scrolling mode active', 'info');
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-all flex items-center gap-1 ${
                        isAutoScroll 
                          ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-lg shadow-emerald-600/30' 
                          : 'bg-slate-900/80 border-slate-700 text-slate-400'
                      }`}
                      title="TikTok Auto-Scroll Feature"
                    >
                      <Zap className={`w-3 h-3 ${isAutoScroll ? 'text-amber-300 animate-bounce' : 'text-slate-400'}`} />
                      <span>{isAutoScroll ? 'Auto On' : 'Auto Off'}</span>
                    </button>

                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 transition-colors"
                      title={isMuted ? "Unmute Sound" : "Mute Sound"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-pink-400" /> : <Volume2 className="w-4 h-4 text-indigo-300" />}
                    </button>

                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 transition-colors"
                      title={isPlaying ? "Pause Reel" : "Play Reel"}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 text-slate-200" /> : <Play className="w-4 h-4 text-emerald-400" />}
                    </button>
                  </div>
                </div>

                {/* Bottom Overlay Info & Right Side Actions */}
                <div className="relative z-10 p-4 flex items-end justify-between gap-3 text-white">
                  
                  {/* Left Bottom Creator & Post Info */}
                  <div className="flex-1 min-w-0 space-y-2">
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
                          {reel.videoDetails?.views.toLocaleString() || '18.4K'} views • {reel.createdAt}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleFollow(reel.author.id, reel.author.username)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-md transition-all shrink-0 ${
                          isFollowed 
                            ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                        }`}
                      >
                        {isFollowed ? 'Following' : '+ Follow'}
                      </button>
                    </div>

                    <p className="text-xs line-clamp-2 text-slate-200 leading-relaxed font-sans">
                      {reel.content}
                    </p>

                    {/* Tags */}
                    {reel.tags && reel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reel.tags.slice(0, 3).map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] text-indigo-300 font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Audio Track Pill */}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-200 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full w-fit max-w-full">
                      <Disc3 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {reel.videoDetails?.audioTrack || 'Original Sound - MuniSynth'}
                      </span>
                    </div>
                  </div>

                  {/* Right Action Vertical Bar */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    
                    {/* Like Button */}
                    <button 
                      onClick={() => toggleLike(reel.id)}
                      className="flex flex-col items-center gap-1 group"
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

                    {/* Comment Button (Opens Comment Drawer) */}
                    <button 
                      onClick={() => setActiveCommentsReel(reel)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white group-hover:bg-slate-800 transition-all">
                        <MessageCircle className="w-5 h-5 text-slate-200" />
                      </div>
                      <span className="text-[10px] font-bold">
                        {reelComments.length}
                      </span>
                    </button>

                    {/* Bookmark Button */}
                    <button 
                      onClick={() => toggleBookmark(reel.id)}
                      className="flex flex-col items-center gap-1 group"
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

                    {/* Share Button */}
                    <button 
                      onClick={() => handleShare(reel)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white group-hover:bg-slate-800 transition-all">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold">Share</span>
                    </button>

                    {/* Direct Scroll Up / Down Chevron Buttons */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
                      <button 
                        onClick={() => scrollToIndex(index - 1)}
                        disabled={index === 0}
                        className="p-2 rounded-full bg-slate-900/90 text-white disabled:opacity-20 hover:bg-slate-800 transition-all border border-slate-700"
                        title="Previous Reel"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => scrollToIndex(index + 1)}
                        disabled={index === reelPosts.length - 1}
                        className="p-2 rounded-full bg-slate-900/90 text-white disabled:opacity-20 hover:bg-slate-800 transition-all border border-slate-700"
                        title="Next Reel"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* Scroll Helper Hint floating at bottom center */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
            <span>{isAutoScroll ? '⚡ TikTok Auto Scroll Active' : 'Scroll ↑↓ or drag to switch reels'}</span>
          </div>
        </div>

      </div>

      {/* Slide-Up Comments Drawer Overlay */}
      {activeCommentsReel && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-300">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 flex flex-col max-h-[85%] text-white space-y-3">
            
            {/* Modal Header */}
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

            {/* Comments List with Formatted Text */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[320px]">
              {(commentsMap[activeCommentsReel.id] || []).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                (commentsMap[activeCommentsReel.id] || []).map((c) => (
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
                ))
              )}
            </div>

            {/* Input & Smart AI Suggestion */}
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
                <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-0.5">
                  Quick Reply:
                </span>
                {['🔥 *Epic reel!*', 'Awesome _visual effects!_ ✨', 'Super informative content! `4K HDR` 🚀'].map((quick, qIdx) => (
                  <button 
                    key={qIdx}
                    onClick={() => setCommentText(quick)}
                    className="px-2.5 py-1 rounded-full text-[10px] bg-slate-800 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500 text-slate-300 shrink-0 transition-colors"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

