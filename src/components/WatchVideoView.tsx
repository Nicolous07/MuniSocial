import React, { useState } from 'react';
import { 
  Tv, 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  ListTree, 
  MessageSquare, 
  Heart, 
  Share2, 
  ShieldCheck, 
  DollarSign, 
  Loader2, 
  Send,
  ThumbsUp,
  Bookmark
} from 'lucide-react';
import { SocialPost, UserProfile } from '../types';

interface WatchVideoViewProps {
  posts: SocialPost[];
  user: UserProfile;
  isDarkMode: boolean;
}

export const WatchVideoView: React.FC<WatchVideoViewProps> = ({
  posts,
  user,
  isDarkMode
}) => {
  const watchPosts = posts.filter(p => p.type === 'long_video' || p.videoDetails?.aspectRatio === '16:9');
  const activeVideo = watchPosts[0] || posts[2] || posts[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveChatMessages, setLiveChatMessages] = useState([
    { user: 'Sarah_Dev', text: 'This microservices breakdown is incredible! 🔥', isSuperChat: false },
    { user: 'CryptoCoder', text: 'Sent $20.00 Super Chat: "Great work on Gemini 3.6 Flash integration!"', isSuperChat: true, amount: '$20.00' },
    { user: 'Alex_Architect', text: 'How do you handle Redis cache invalidation on cluster nodes?', isSuperChat: false },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/summarize-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeVideo.content,
          description: activeVideo.content,
          transcript: 'Full breakdown of microservices architecture, Gemini AI server-side proxy, and Redis caching.'
        })
      });
      const data = await res.json();
      setAiAnalysis(data.analysis || 'Video summary successfully generated.');
    } catch (e) {
      setAiAnalysis('✨ **MuniAI 2-Minute Video Summary**:\n1. Explains Node.js + Express backend setup with zero API key leaks.\n2. Demonstrates Redis caching strategy for 1B users.\n3. Shows live Kubernetes deployment on Cloud Run.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setLiveChatMessages(prev => [...prev, { user: user.name, text: chatInput, isSuperChat: false }]);
    setChatInput('');
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Top Header Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl">MuniWatch 4K</h1>
            <p className="text-xs text-slate-400">Long-form videos, masterclasses & 8K streams</p>
          </div>
        </div>

        <button
          onClick={handleAiAnalyze}
          disabled={isAnalyzing}
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-300" />}
          <span>Generate AI Video Chapters & Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main 4K Video Player & Chapters Column */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Main Video Screen Frame */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-2xl group">
            {activeVideo.videoUrl || (activeVideo.mediaUrl && (activeVideo.mediaUrl.endsWith('.mp4') || activeVideo.mediaUrl.endsWith('.webm') || activeVideo.mediaUrl.includes('/uploads/video_'))) ? (
              <video 
                src={activeVideo.videoUrl || activeVideo.mediaUrl}
                poster={activeVideo.thumbnailUrl || activeVideo.mediaUrls?.[0]}
                controls
                autoPlay={isPlaying}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <>
                <img 
                  src={activeVideo.mediaUrls?.[0] || activeVideo.mediaUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'} 
                  alt="Video stream" 
                  className="w-full h-full object-cover"
                />
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-center justify-center pointer-events-none">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 group-hover:scale-110 transition-transform pointer-events-auto"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                  </button>
                </div>
              </>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full font-mono text-xs border border-slate-700">
                4K Ultra HD • HDR 10-bit
              </span>
              <span className="bg-indigo-600/80 backdrop-blur-md px-3 py-1 rounded-full font-mono text-xs">
                {activeVideo.videoDetails?.views.toLocaleString() || '128,900'} Views
              </span>
            </div>
          </div>

          {/* Video Title & Actions */}
          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="font-heading font-bold text-base sm:text-lg leading-snug mb-3">
              {activeVideo.content}
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <img src={activeVideo.author.avatar} alt={activeVideo.author.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/30" />
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm">
                    <span>{activeVideo.author.name}</span>
                    {activeVideo.author.verified && <ShieldCheck className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <span className="text-xs text-slate-400">{activeVideo.author.followersCount?.toLocaleString() || '520K'} Subscribers</span>
                </div>
                <button className="ml-3 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md">
                  Subscribe
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold">
                  <ThumbsUp className="w-4 h-4 text-indigo-400" />
                  <span>{(activeVideo.likesCount || 18900).toLocaleString()}</span>
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold">
                  <Bookmark className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Video Chapters Accordion */}
            {activeVideo.videoDetails?.chapters && (
              <div className="mt-4 space-y-2">
                <h4 className="font-heading font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
                  <ListTree className="w-4 h-4 text-indigo-400" /> Interactive Video Chapters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeVideo.videoDetails.chapters.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveChapter(idx)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        activeChapter === idx 
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold' 
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span>{ch.title}</span>
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {ch.time}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Generated Summary Box */}
            {aiAnalysis && (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 text-xs leading-relaxed space-y-2 animate-fade-in">
                <div className="font-bold text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> MuniAI Video Breakdown
                </div>
                <div className="whitespace-pre-line text-slate-200">{aiAnalysis}</div>
              </div>
            )}

          </div>

        </div>

        {/* Live Chat & Super Chats Column */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className={`p-5 rounded-3xl border flex flex-col justify-between h-[520px] ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <h3 className="font-heading font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" /> Live Stream Chat
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> 1,420 Live
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {liveChatMessages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl text-xs space-y-1 ${
                    m.isSuperChat 
                      ? 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/40' 
                      : 'bg-slate-950/60 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span className={m.isSuperChat ? 'text-amber-300' : 'text-slate-300'}>{m.user}</span>
                    {m.isSuperChat && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-extrabold">
                        {m.amount}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Send Live Chat Form */}
            <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800/60 flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Send a message or Super Chat..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit"
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
