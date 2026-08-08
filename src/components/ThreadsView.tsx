import React, { useState } from 'react';
import { 
  MessageSquareCode, 
  Repeat2, 
  Heart, 
  Bookmark, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  ListPlus, 
  Flame, 
  Send
} from 'lucide-react';
import { SocialPost, UserProfile } from '../types';

interface ThreadsViewProps {
  posts: SocialPost[];
  user: UserProfile;
  isDarkMode: boolean;
  onOpenCreate: () => void;
}

export const ThreadsView: React.FC<ThreadsViewProps> = ({
  posts = [],
  user,
  isDarkMode,
  onOpenCreate
}) => {
  const threadPosts = (posts || []).filter(p => p && (p.type === 'thread' || p.threadSequence || p.type === 'text'));
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadReplyInput, setThreadReplyInput] = useState('');

  return (
    <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl">MuniThreads</h1>
            <p className="text-xs text-slate-400">Short-form discussions, nested quotes, and AI synthesis</p>
          </div>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <ListPlus className="w-4 h-4" />
          <span>New Thread</span>
        </button>
      </div>

      {/* Thread Stream */}
      <div className="space-y-4">
        {(threadPosts || [])?.map((post) => (
          <article
            key={post.id}
            className={`p-5 rounded-3xl border transition-all overflow-hidden ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span className="truncate">{post.author.name}</span>
                  {post.author.verified && <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />}
                </div>
                <span className="text-xs text-slate-400 truncate block">@{post.author.username} • {post.createdAt}</span>
              </div>
            </div>

            {/* Content */}
            <p className="text-xs sm:text-sm leading-relaxed mb-3 font-sans break-words [overflow-wrap:anywhere]">{post.content}</p>

            {/* Nested Thread Sequence */}
            {post.threadSequence && (
              <div className="space-y-2 my-3 pl-4 border-l-2 border-indigo-500/50">
                {post.threadSequence?.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 break-words [overflow-wrap:anywhere]">
                    {t}
                  </div>
                ))}
              </div>
            )}

            {/* Thread Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-slate-400 text-xs">
              <button className="flex items-center gap-1.5 hover:text-pink-400">
                <Heart className="w-4 h-4" />
                <span>{post.likesCount}</span>
              </button>
              <button 
                onClick={() => setActiveThreadId(activeThreadId === post.id ? null : post.id)}
                className="flex items-center gap-1.5 hover:text-indigo-400"
              >
                <MessageSquareCode className="w-4 h-4" />
                <span>{post.commentsCount} Replies</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-emerald-400">
                <Repeat2 className="w-4 h-4" />
                <span>Repost</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-amber-400">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1.5 hover:text-white">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Reply Drawer */}
            {activeThreadId === post.id && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Post your reply to thread..."
                  value={threadReplyInput}
                  onChange={(e) => setThreadReplyInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (threadReplyInput.trim()) {
                      alert(`Thread reply published!`);
                      setThreadReplyInput('');
                    }
                  }}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}

          </article>
        ))}
      </div>

    </div>
  );
};
