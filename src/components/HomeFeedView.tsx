import React, { useState, useRef, useEffect } from 'react';
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
  Video
} from 'lucide-react';
import { SocialPost, Story, UserProfile } from '../types';

interface HomeFeedViewProps {
  posts: SocialPost[];
  stories: Story[];
  user: UserProfile;
  isDarkMode: boolean;
  onSelectView: (view: string) => void;
  onOpenCreate: () => void;
  onToggleAiDrawer: () => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  posts,
  stories,
  user,
  isDarkMode,
  onSelectView,
  onOpenCreate,
  onToggleAiDrawer
}) => {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({
    post_1: true,
    post_code_1: true,
  });
  const [smartReplies, setSmartReplies] = useState<Record<string, string[]>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Floating Chat Widget state
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);
  const [quickChatInput, setQuickChatInput] = useState('');
  const [quickChatMessages, setQuickChatMessages] = useState([
    { id: '1', sender: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', text: 'Hey! Loved your latest MuniShort reel! 🔥', time: '10:42 AM' },
    { id: '2', sender: 'MuniAI Copilot', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80', text: 'MuniAI is standing by to help draft responses or generate content.', time: '10:43 AM' }
  ]);

  const quickChatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-close floating quick chat when clicking outside OR after 30 seconds of inactivity
  useEffect(() => {
    if (!isQuickChatOpen) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsQuickChatOpen(false);
      }, 30000); // 30 seconds auto-hide
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
    setLikedPostIds(prev => ({ ...prev, [postId]: !prev[postId] }));
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

    // Simulate instant AI reply
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 relative">
      
      {/* Main Feed Column */}
      <main className="lg:col-span-8 space-y-6">
        
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
            <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-mono font-bold">Real-time</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {/* My Story Add */}
            <button 
              onClick={onOpenCreate}
              className="flex flex-col items-center gap-1.5 group shrink-0"
            >
              <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-indigo-500/60 group-hover:border-indigo-400 transition-colors flex items-center justify-center">
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-slate-950 text-white text-xs font-bold shadow-md">
                  +
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-slate-300">Add Story</span>
            </button>

            {/* Friend Stories */}
            {stories.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStory(s)}
                className="flex flex-col items-center gap-1.5 group shrink-0"
              >
                <div className={`p-0.5 rounded-full bg-gradient-to-tr ${
                  s.hasUnseen ? 'from-indigo-500 via-purple-500 to-pink-500 ring-2 ring-indigo-500/30' : 'from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800'
                } group-hover:scale-105 transition-transform`}>
                  <img src={s.author.avatar} alt={s.author.name} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-950" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-300 truncate w-16 text-center">
                  {s.author.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Create Bar Trigger */}
        <div className={`p-4 rounded-3xl border flex items-center gap-3 transition-all ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-800' 
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0" />
          <button
            onClick={onOpenCreate}
            className={`flex-1 text-left px-4 py-2.5 rounded-2xl border text-xs transition-colors flex items-center justify-between ${
              isDarkMode 
                ? 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200' 
                : 'bg-slate-100/90 border-slate-200 text-slate-900 hover:text-black font-semibold'
            }`}
          >
            <span>What's on your mind, {user.name.split(' ')[0]}? Share with MuniAI...</span>
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>
        </div>

        {/* Posts Stream */}
        <div className="space-y-6">
          {posts.map((post) => {
            const isLiked = likedPostIds[post.id] || false;

            return (
              <article
                key={post.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700' 
                    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm hover:border-slate-300'
                }`}
              >
                {/* Author Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-indigo-500/20" />
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
                    {post.aiScore && (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                        <Flame className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> AI Score {post.aiScore}
                      </span>
                    )}
                    <button className="p-1.5 text-slate-500 hover:text-slate-950 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Post Body Content */}
                <div className="text-xs sm:text-sm leading-relaxed mb-4 space-y-3">
                  <p className="whitespace-pre-line text-slate-950 dark:text-slate-100 font-normal">{post.content}</p>

                  {/* Thread Sequence rendered */}
                  {post.type === 'thread' && post.threadSequence && (
                    <div className="space-y-2.5 my-3 pl-3 border-l-2 border-indigo-500/60">
                      {post.threadSequence.map((item, idx) => (
                        <p key={idx} className={`p-2.5 rounded-xl border text-xs ${
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
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs my-3 text-white">
                      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-emerald-400" /> {post.codeDetails.language}
                        </span>
                        <span>Formatted by MuniAI</span>
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
                        {post.pollDetails.options.map((opt, idx) => {
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
                      <p className="text-[10px] text-slate-500 text-right">{post.pollDetails.totalVotes.toLocaleString()} votes</p>
                    </div>
                  )}

                  {/* Media / Video Preview */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && post.type !== 'short_video' && post.type !== 'long_video' && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-3">
                      <img src={post.mediaUrls[0]} alt="Post media" className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}

                  {/* Reel or Long Video Card */}
                  {(post.type === 'short_video' || post.type === 'long_video') && post.videoDetails && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 group my-3 bg-slate-950">
                      <img 
                        src={post.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80'} 
                        alt="Video thumbnail" 
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
                          {post.videoDetails.views.toLocaleString()} Views
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hashtags Row */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map((t, idx) => (
                    <span key={idx} className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Post Actions Row */}
                <div className={`flex items-center justify-between pt-3 border-t text-xs ${
                  isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
                }`}>
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 hover:text-pink-500 transition-colors ${isLiked ? 'text-pink-500 font-bold' : ''}`}
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
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentsCount}</span>
                  </button>

                  <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                    <Repeat2 className="w-4 h-4" />
                    <span>{post.repostsCount}</span>
                  </button>

                  <button className="flex items-center gap-1.5 hover:text-amber-500 transition-colors">
                    <Bookmark className="w-4 h-4" />
                    <span>{post.bookmarksCount}</span>
                  </button>

                  <button className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
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
                            alert(`Comment added: "${commentInput}"`);
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
                        {post.comments.map((c) => (
                          <div key={c.id} className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <img src={c.author.avatar} alt={c.author.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-1 font-bold">
                                <span className="text-slate-900 dark:text-slate-200">{c.author.name}</span>
                                <span className="text-[10px] text-slate-500">@{c.author.username}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{c.text}</p>
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
        </div>

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
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
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
                <button className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow-md">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* Story View Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <button 
              onClick={() => setActiveStory(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-800"
            >
              ✕
            </button>
            <img src={activeStory.mediaUrl} alt="Story" className="w-full h-96 object-cover" />
            <div className="p-4 bg-slate-950 text-xs space-y-2 text-white">
              <div className="flex items-center gap-2">
                <img src={activeStory.author.avatar} alt="Author" className="w-8 h-8 rounded-full object-cover" />
                <span className="font-bold">{activeStory.author.name}</span>
              </div>
              {activeStory.caption && <p className="text-slate-300">{activeStory.caption}</p>}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING CHAT WIDGET CONTAINER WITH AUTO-CLOSE REF */}
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
  );
};
