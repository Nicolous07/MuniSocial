import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Heart, 
  Clock, 
  Share2, 
  Volume2, 
  VolumeX,
  Eye,
  Search,
  Copy,
  Check,
  Link,
  MessageSquare,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Story, UserProfile, StoryViewer } from '../types';
import { getStoryTimeRemaining } from '../lib/storyUtils';
import { triggerHaptic } from '../lib/haptics';

interface StoryViewerModalProps {
  stories: Story[];
  initialStoryId: string;
  onClose: () => void;
  user: UserProfile;
  onSendDirectMessage?: (recipientUsername: string, recipientName: string, recipientAvatar: string, text: string) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'alert' | 'error') => void;
}

interface FloatingParticle {
  id: string;
  emoji: string;
  x: number; // percentage 10-90
  scale: number; // 0.8 to 1.5
  rotation: number; // -30 to 30 deg
}

const PRIMARY_EMOJI_REACTIONS = ['🔥', '❤️', '😂', '😮', '👏', '💯', '🎉', '⚡'];
const EXPANDED_EMOJI_REACTIONS = ['🚀', '🌟', '👑', '😍', '🥳', '💡', '💎', '🙌', '🎯', '✨', '🌈', '🤩', '🏆', '🍕', '🎮', '🦄'];
const EMOJI_REACTIONS = [...PRIMARY_EMOJI_REACTIONS, ...EXPANDED_EMOJI_REACTIONS];
const STORY_DURATION_MS = 5000; // 5 seconds per story

const playReactionChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // Audio autoplay restrictions handled gracefully
  }
};

// Mock recent contacts for internal message sharing
const MOCK_CONTACTS = [
  { name: 'Elena Rostova', username: 'elena_ai', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
  { name: 'Marcus Vance', username: 'marcus_tech', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { name: 'Sophia Chen', username: 'sophiadesign', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80' },
  { name: 'David K. Miller', username: 'davemiller_ai', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' },
];

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialStoryId,
  onClose,
  user,
  onSendDirectMessage,
  onShowToast
}) => {
  // Find initial story index
  const initialIdx = stories.findIndex(s => s.id === initialStoryId);
  const [currentIndex, setCurrentIndex] = useState(initialIdx >= 0 ? initialIdx : 0);
  
  const activeStory = stories[currentIndex] || stories[0];
  const isAuthor = Boolean(activeStory?.author && (activeStory.author.username === user?.username || activeStory.author.name === user?.name));

  // Progress state (0 to 100)
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Audio mute/unmute state
  const [isMuted, setIsMuted] = useState(false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  // Long press state
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Share Modal State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedShareUser, setSelectedShareUser] = useState<typeof MOCK_CONTACTS[0] | null>(null);
  const [shareNote, setShareNote] = useState('');

  // 'Seen By' Drawer State (Visible to author only)
  const [isSeenByOpen, setIsSeenByOpen] = useState(false);
  const [seenBySearch, setSeenBySearch] = useState('');

  // Message Reply State
  const [replyText, setReplyText] = useState('');
  
  // Reaction particles state & count tracking
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [showExpandedPicker, setShowExpandedPicker] = useState<boolean>(false);
  const [storyReactionCounts, setStoryReactionCounts] = useState<Record<string, Record<string, number>>>({
    'story_1': { '🔥': 18, '❤️': 32, '👏': 12, '⚡': 7 },
    'story_2': { '🔥': 24, '🎉': 15, '💯': 9 },
    'story_3': { '❤️': 45, '🚀': 19, '🌟': 11 }
  });

  // Double tap heart animation
  const [showBigHeart, setShowBigHeart] = useState(false);
  const lastTapRef = useRef<number>(0);

  // Video Element Ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto progress timer
  useEffect(() => {
    if (!activeStory || isPaused || isInputFocused || isShareOpen || isSeenByOpen || isLongPressing) return;

    const intervalTime = 50; // ms
    const increment = (intervalTime / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev + increment >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(c => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, isInputFocused, isShareOpen, isSeenByOpen, isLongPressing, stories.length, onClose, activeStory]);

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0);
    setIsShareOpen(false);
    setIsSeenByOpen(false);
    setIsLongPressing(false);
  }, [currentIndex]);

  if (!activeStory) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newMute = !isMuted;
    setIsMuted(newMute);
    setAudioNotice(newMute ? 'Audio Muted 🔇' : 'Audio Unmuted 🔊');
    
    if (videoRef.current) {
      videoRef.current.muted = newMute;
    }

    setTimeout(() => {
      setAudioNotice(null);
    }, 1500);
  };

  // Long press handlers
  const handleTouchMouseDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      setIsPaused(true);
    }, 250);
  };

  const handleTouchMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPressing) {
      setIsLongPressing(false);
      setIsPaused(false);
    }
  };

  const triggerEmojiReaction = (emoji: string) => {
    triggerHaptic('reaction');
    playReactionChime();

    // Create energetic multi-particle explosion
    const newParticles: FloatingParticle[] = [];
    const numParticles = 10;
    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        emoji,
        x: 10 + Math.random() * 80,
        scale: 0.7 + Math.random() * 0.9,
        rotation: -30 + Math.random() * 60
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    // Update story reaction count state
    if (activeStory?.id) {
      setStoryReactionCounts(prev => {
        const storyCounts = prev[activeStory.id] || {};
        return {
          ...prev,
          [activeStory.id]: {
            ...storyCounts,
            [emoji]: (storyCounts[emoji] || 0) + 1
          }
        };
      });
    }

    if (onSendDirectMessage) {
      onSendDirectMessage(
        activeStory?.author?.username || 'user',
        activeStory?.author?.name || 'Creator',
        activeStory?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        `Reacted ${emoji} to your story`
      );
    }

    if (onShowToast) {
      onShowToast(`Reaction Sent ${emoji}`, `Shared reaction with @${activeStory?.author?.username || 'user'}`, 'info');
    }

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1400);
  };

  const handleSendReply = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!replyText.trim()) return;

    const messageToSend = replyText.trim();
    setReplyText('');
    setIsInputFocused(false);

    if (onSendDirectMessage) {
      onSendDirectMessage(
        activeStory?.author?.username || 'user',
        activeStory?.author?.name || 'Creator',
        activeStory?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        `Replying to story: "${activeStory.caption || 'Media'}" - ${messageToSend}`
      );
    }

    if (onShowToast) {
      onShowToast('Reply Delivered! 💬', `Private message sent to ${activeStory?.author?.name || 'Creator'}`, 'success');
    }

    triggerEmojiReaction('💬');
  };

  const handleStoryImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLongPressing) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setLikedStories(prev => ({ ...prev, [activeStory.id]: true }));
      setShowBigHeart(true);
      triggerEmojiReaction('❤️');
      setTimeout(() => setShowBigHeart(false), 800);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.3) {
      handlePrev();
    } else if (clickX > width * 0.7) {
      handleNext();
    }
  };

  const handleCopyLink = () => {
    const storyUrl = `https://munisocial.app/story/${activeStory.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(storyUrl);
    }
    setCopiedLink(true);
    if (onShowToast) {
      onShowToast('Link Copied! 📋', 'Story URL copied to clipboard.', 'success');
    }
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareToUser = (targetUser: typeof MOCK_CONTACTS[0]) => {
    if (onSendDirectMessage) {
      const shareMessage = shareNote.trim() 
        ? `Shared a story: "${activeStory.caption || 'Story'}" — Note: ${shareNote.trim()}`
        : `Shared a story from @${activeStory?.author?.username || 'user'}: "${activeStory.caption || 'Story'}"`;

      onSendDirectMessage(
        targetUser.username,
        targetUser.name,
        targetUser.avatar,
        shareMessage
      );
    }

    if (onShowToast) {
      onShowToast('Story Shared! 📩', `Sent to ${targetUser.name} via messages.`, 'success');
    }

    setIsShareOpen(false);
    setSelectedShareUser(null);
    setShareNote('');
  };

  const isCurrentLiked = likedStories[activeStory.id] || false;
  const seenByList: StoryViewer[] = activeStory.seenBy || [];
  const filteredSeenBy = seenByList.filter(s => 
    s.name.toLowerCase().includes(seenBySearch.toLowerCase()) || 
    s.username.toLowerCase().includes(seenBySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200">
      
      {/* Background Dimmed Overlay */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Main Story Container Frame */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[92vh] max-h-[820px] rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900 shadow-2xl flex flex-col justify-between ring-1 ring-white/10">
        
        {/* TOP PROGRESS BARS & HEADER - HIDDEN ON LONG PRESS */}
        <div className={`absolute top-0 left-0 right-0 z-30 p-3 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pt-3 space-y-2 transition-opacity duration-200 ${isLongPressing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((storyItem, idx) => {
              let segmentFill = 0;
              if (idx < currentIndex) {
                segmentFill = 100;
              } else if (idx === currentIndex) {
                segmentFill = progress;
              } else {
                segmentFill = 0;
              }

              return (
                <div 
                  key={storyItem.id} 
                  className="flex-1 h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setProgress(0);
                  }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 rounded-full transition-all duration-75 ease-linear"
                    style={{ width: `${segmentFill}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* AUTHOR INFO & CONTROLS HEADER */}
          <div className="flex items-center justify-between text-white pt-1">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md">
                <img 
                  src={activeStory?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} 
                  alt={activeStory?.author?.name || 'Creator'} 
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm tracking-tight text-white drop-shadow-sm">{activeStory?.author?.name || 'Creator'}</span>
                  <span className="text-[10px] text-slate-300 font-mono">@{activeStory?.author?.username || 'user'}</span>
                </div>
                
                {/* 24-Hour Expiration Timer */}
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-slate-300">{activeStory.createdAt}</span>
                  <span className="text-slate-400">•</span>
                  <span className="flex items-center gap-0.5 text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded-full border border-amber-400/30 font-mono font-semibold">
                    <Clock className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                    <span>{getStoryTimeRemaining(activeStory)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Action Buttons (Mute, Share, Pause, Close) */}
            <div className="flex items-center gap-1.5">
              {/* Audio Mute/Unmute Toggle */}
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all text-xs"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              {/* Share Story Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareOpen(true);
                }}
                className="p-1.5 rounded-full bg-slate-900/80 hover:bg-indigo-600/60 text-slate-200 hover:text-white border border-slate-700/60 backdrop-blur-md transition-all text-xs"
                title="Share Story"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* Pause/Play Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all text-xs font-mono font-bold px-2"
                title={isPaused ? "Resume Story" : "Pause Story"}
              >
                {isPaused ? "▶" : "❚❚"}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-900/50 text-slate-200 hover:text-white border border-slate-700/60 backdrop-blur-md transition-all"
                title="Close Viewer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* LONG PRESS HOLDING INDICATOR PILL */}
        {isLongPressing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full bg-slate-950/90 border border-amber-500/40 text-[11px] font-medium text-amber-300 backdrop-blur-md flex items-center gap-1.5 animate-pulse shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Story Paused (Holding)</span>
          </div>
        )}

        {/* AUDIO MUTE/UNMUTE FLOATING NOTICE BADGE */}
        {audioNotice && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-indigo-500/40 text-xs font-semibold text-white backdrop-blur-md shadow-xl animate-in zoom-in duration-150">
            {audioNotice}
          </div>
        )}

        {/* STORY MEDIA DISPLAY AREA */}
        <div 
          className="relative flex-1 w-full h-full bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden group"
          onClick={handleStoryImageClick}
          onMouseDown={handleTouchMouseDown}
          onMouseUp={handleTouchMouseUp}
          onMouseLeave={handleTouchMouseUp}
          onTouchStart={handleTouchMouseDown}
          onTouchEnd={handleTouchMouseUp}
        >
          {/* Main Story Image or Video */}
          {activeStory.type === 'video' ? (
            <video
              ref={videoRef}
              src={activeStory.mediaUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover select-none"
            />
          ) : (
            <img 
              src={activeStory.mediaUrl} 
              alt="Story content" 
              className="w-full h-full object-cover select-none" 
            />
          )}

          {/* Vignette Gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/90 pointer-events-none" />

          {/* Quick Reaction Floating Bar on Long-Press / Hold */}
          {isLongPressing && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-3xl bg-slate-950/90 border border-indigo-500/50 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in duration-200">
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                <span>Quick Story Reaction</span>
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {EMOJI_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerEmojiReaction(emoji);
                    }}
                    className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-400 text-2xl hover:scale-130 active:scale-90 transition-all shadow-lg"
                    title={`Send ${emoji} reaction`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Release or tap emoji to react</span>
            </div>
          )}

          {/* Double Tap Big Animated Heart overlay */}
          {showBigHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in duration-300">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl animate-bounce" />
            </div>
          )}

          {/* FLOATING REACTION PARTICLE ANIMATIONS OVER STORY */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute bottom-20 pointer-events-none animate-float-up text-3xl sm:text-4xl drop-shadow-lg z-30"
              style={{
                left: `${p.x}%`,
                transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
              }}
            >
              {p.emoji}
            </div>
          ))}

          {/* Live Story Reaction Pill Badges Overlay */}
          {activeStory?.id && storyReactionCounts[activeStory.id] && (
            <div className="absolute top-16 left-3 z-30 flex items-center gap-1.5 flex-wrap max-w-[80%] pointer-events-none">
              {Object.entries(storyReactionCounts[activeStory.id]).map(([emoji, count]) => {
                const numCount = Number(count) || 0;
                if (numCount <= 0) return null;
                return (
                  <span 
                    key={emoji}
                    className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-indigo-500/30 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow-lg animate-in zoom-in duration-150"
                  >
                    <span className="text-xs">{emoji}</span>
                    <span className="text-indigo-300 font-mono text-[10px]">{numCount}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Story Caption Overlay - HIDDEN ON LONG PRESS */}
          {activeStory.caption && !isLongPressing && (
            <div className="absolute bottom-28 left-3 right-3 z-20 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md text-white">
              <p className="text-xs sm:text-sm font-medium leading-snug drop-shadow-md">
                {activeStory.caption}
              </p>
            </div>
          )}

          {/* Desktop Left / Right Arrow Hover Controls */}
          {currentIndex > 0 && !isLongPressing && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-950/70 hover:bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
              title="Previous Story"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {currentIndex < stories.length - 1 && !isLongPressing && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-950/70 hover:bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
              title="Next Story"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

        </div>

        {/* BOTTOM SECTION: 'SEEN BY' LIST FOR AUTHOR OR EMOJI & MESSAGING FOR OTHERS */}
        <div className={`relative z-30 p-3 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-2xl space-y-2.5 transition-opacity duration-200 ${isLongPressing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          
          {/* AUTHOR VIEW: SEEN BY BUTTON AT THE BOTTOM */}
          {isAuthor ? (
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                onClick={() => setIsSeenByOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 text-xs font-semibold text-white flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span>Seen by {seenByList.length} people</span>
                </div>
                
                {/* Avatars Stack Preview */}
                <div className="flex items-center -space-x-2">
                  {seenByList.slice(0, 3).map((v, idx) => (
                    <img 
                      key={v.id || idx} 
                      src={v.avatar} 
                      alt={v.name} 
                      className="w-6 h-6 rounded-full border border-slate-800 object-cover" 
                    />
                  ))}
                  <span className="text-[10px] text-indigo-400 group-hover:translate-x-0.5 transition-transform ml-1.5 font-bold">Details ›</span>
                </div>
              </button>

              {/* Share button for author too */}
              <button
                onClick={() => setIsShareOpen(true)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
                title="Share Story Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* QUICK EMOJI REACTION SELECTION STRIP */}
              <div className="flex items-center justify-between gap-1 py-1 px-1 bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-md">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 py-0.5">
                  {PRIMARY_EMOJI_REACTIONS.map((emoji, eIdx) => {
                    const currentCount = (activeStory?.id && storyReactionCounts[activeStory.id]?.[emoji]) || 0;
                    return (
                      <button
                        key={eIdx}
                        type="button"
                        onClick={() => triggerEmojiReaction(emoji)}
                        className="relative group px-2 py-1 rounded-xl bg-slate-900 hover:bg-gradient-to-tr hover:from-indigo-600 hover:to-purple-600 border border-slate-700/60 hover:border-indigo-400 text-lg sm:text-xl transition-all active:scale-90 hover:scale-130 hover:-translate-y-1 shadow-sm flex items-center gap-1 shrink-0"
                        title={`React ${emoji}`}
                      >
                        <span className="group-hover:animate-bounce">{emoji}</span>
                        {currentCount > 0 && (
                          <span className="text-[9px] font-mono font-bold text-indigo-300 group-hover:text-white">
                            {currentCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Expand More Emojis Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowExpandedPicker(!showExpandedPicker);
                    triggerHaptic('selection');
                  }}
                  className={`p-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    showExpandedPicker 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/50' 
                      : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-indigo-300 hover:text-white'
                  }`}
                  title="More Reactions"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-pink-400 ${showExpandedPicker ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] hidden sm:inline">More</span>
                </button>
              </div>

              {/* EXPANDED INTERACTIVE EMOJI PICKER POPUP */}
              {showExpandedPicker && (
                <div className="p-3 bg-slate-900/95 border border-indigo-500/40 rounded-2xl backdrop-blur-2xl shadow-2xl space-y-2 animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 border-b border-slate-800 pb-1.5">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Animated Reactions</span>
                    </span>
                    <button 
                      onClick={() => setShowExpandedPicker(false)}
                      className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-slate-800"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-8 gap-1.5">
                    {EXPANDED_EMOJI_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          triggerEmojiReaction(emoji);
                        }}
                        className="p-2 rounded-xl bg-slate-950/80 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-400 text-xl hover:scale-135 transition-all active:scale-90 flex items-center justify-center shadow-md"
                        title={`React ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SEND MESSAGE INPUT FORM DIRECTLY AT THE BOTTOM */}
              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder={`Send message to @${activeStory?.author?.username || 'user'}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onFocus={() => {
                      setIsInputFocused(true);
                      setIsPaused(true);
                    }}
                    onBlur={() => {
                      setIsInputFocused(false);
                      setIsPaused(false);
                    }}
                    className="w-full pl-3.5 pr-10 py-2 rounded-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500/80 text-xs text-white placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newLiked = !isCurrentLiked;
                      setLikedStories(prev => ({ ...prev, [activeStory.id]: newLiked }));
                      if (newLiked) triggerEmojiReaction('❤️');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Like Story"
                  >
                    <Heart className={`w-4 h-4 ${isCurrentLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white disabled:opacity-40 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center shrink-0"
                  title="Send Private Reply"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}

        </div>

        {/* SHARE MODAL OVERLAY */}
        {isShareOpen && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl p-4 flex flex-col justify-end animate-in fade-in slide-in-from-bottom duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Share Story</h3>
                </div>
                <button 
                  onClick={() => setIsShareOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Copy Link Option */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Direct Story Link</span>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <input 
                    type="text" 
                    readOnly 
                    value={`https://munisocial.app/story/${activeStory.id}`}
                    className="flex-1 bg-transparent text-xs text-slate-300 font-mono outline-none px-1"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Share in Internal Messages */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Share in Direct Messages</span>
                
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto no-scrollbar">
                  {MOCK_CONTACTS.map((contact) => (
                    <button
                      key={contact.username}
                      onClick={() => handleShareToUser(contact)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
                    >
                      <img src={contact.avatar} alt={contact.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{contact.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">@{contact.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsShareOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 'SEEN BY' DRAWER OVERLAY (VISIBLE ONLY TO STORY AUTHOR) */}
        {isSeenByOpen && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-end animate-in fade-in slide-in-from-bottom duration-200">
            <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 space-y-3 h-[70%] flex flex-col shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Story Viewers</h3>
                    <p className="text-[10px] text-slate-400">{seenByList.length} total views in last 24 hours</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSeenByOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Viewers */}
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search viewers..."
                  value={seenBySearch}
                  onChange={(e) => setSeenBySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Viewers List */}
              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-1">
                {filteredSeenBy.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-medium">No viewers match your search.</p>
                  </div>
                ) : (
                  filteredSeenBy.map((viewer) => (
                    <div 
                      key={viewer.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={viewer.avatar} 
                          alt={viewer.name} 
                          className="w-8 h-8 rounded-full object-cover" 
                        />
                        <div>
                          <p className="text-xs font-semibold text-white">{viewer.name}</p>
                          <p className="text-[10px] text-slate-400">@{viewer.username}</p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">{viewer.viewedAt}</span>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setIsSeenByOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors shrink-0"
              >
                Close Viewers
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Floating UP keyframe CSS style */}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-260px) scale(1.4);
          }
        }
        .animate-float-up {
          animation: floatUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
};
