import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  Sparkles, 
  Paperclip, 
  Mic, 
  ShieldCheck, 
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Eye,
  VideoOff,
  MicOff,
  Users,
  Plus,
  X,
  Code,
  Smile,
  Hash,
  ArrowLeft,
  Play,
  Pause,
  Image as ImageIcon
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { FormattedText } from './FormattedText';
import { triggerHaptic } from '../lib/haptics';

interface MessagesViewProps {
  initialMessages: ChatMessage[];
  user: UserProfile;
  isDarkMode: boolean;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'alert' | 'error') => void;
  onUnreadCountChange?: (count: number) => void;
}

interface ChatThread {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online: boolean;
  lastMessage: string;
  time: string;
  unread: number;
  verified?: boolean;
  isGroup?: boolean;
  members?: string[];
}

const CONVERSATIONS: ChatThread[] = [
  {
    id: 'thread_1',
    name: 'Elena Rostova',
    username: 'elena_ai',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    online: true,
    lastMessage: '*Loved* your latest _MuniShort_ reel! 🔥',
    time: '10:42 AM',
    unread: 2,
    verified: true
  },
  {
    id: 'thread_group_1',
    name: '🚀 Municryptrix AI Creators',
    username: 'group_creators',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    online: true,
    lastMessage: 'Kai: *Testing* the new ~legacy~ `Gemini 3.6` _pipeline_!',
    time: '10:15 AM',
    unread: 4,
    verified: true,
    isGroup: true,
    members: ['Alex Rivera', 'Elena Rostova', 'Kai Takahashi', 'Aria FPV', 'Sara Jenkins']
  },
  {
    id: 'thread_2',
    name: 'Kai Takahashi',
    username: 'kaitakahashi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    online: true,
    lastMessage: 'Did you check out the new `Three.js` 3D render pipeline?',
    time: 'Yesterday',
    unread: 0,
    verified: true
  },
  {
    id: 'thread_ai',
    name: 'MuniAI Copilot',
    username: 'muniai_assistant',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    online: true,
    lastMessage: 'MuniAI is ready! Use *bold*, _italic_, ~strikethrough~ or `code` formatting.',
    time: 'Instant',
    unread: 1,
    verified: true
  },
  {
    id: 'thread_3',
    name: 'Aria FPV',
    username: 'aria_drones',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    online: false,
    lastMessage: 'Sending over the *4K drone footage* snippets now 🚁',
    time: 'Jul 24',
    unread: 0,
    verified: false
  }
];

const AVAILABLE_CONTACTS = [
  { name: 'Elena Rostova', username: 'elena_ai', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
  { name: 'Kai Takahashi', username: 'kaitakahashi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { name: 'Aria FPV', username: 'aria_drones', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { name: 'Sara Jenkins', username: 'sarajenkins', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
  { name: 'David K. Miller', username: 'davemiller_ai', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' },
];

export const MessagesView: React.FC<MessagesViewProps> = ({
  initialMessages,
  user,
  isDarkMode,
  onShowToast,
  onUnreadCountChange
}) => {
  const [activeThreadId, setActiveThreadId] = useState<string>('thread_1');
  const [threads, setThreads] = useState<ChatThread[]>(CONVERSATIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCall, setActiveCall] = useState<'audio' | 'video' | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState<boolean>(false);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Group Creation Modal State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>(['Elena Rostova', 'Kai Takahashi']);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, activeThreadId]);

  // Notify parent of total unread count changes
  React.useEffect(() => {
    const totalUnread = threads.reduce((acc, t) => acc + t.unread, 0);
    onUnreadCountChange?.(totalUnread);
  }, [threads, onUnreadCountChange]);

  const handleSelectThread = (id: string) => {
    triggerHaptic('selection');
    setActiveThreadId(id);
    setShowMobileChat(true);
    // Mark as read when selected
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 0 } : t));
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    triggerHaptic('light');
    const msgId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Update last message in thread preview
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, lastMessage: newMsg.text, time: 'Just now' } : t));

    // 1. Progress to 'sent' after 300ms
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'sent' } : m));
    }, 300);

    // 2. Progress to 'delivered' after 700ms
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m));
    }, 700);

    // 3. Trigger recipient 'typing...' animation after 1000ms
    setTimeout(() => {
      setIsTyping(true);
    }, 1000);

    // 4. Progress to 'read' after 1400ms (Recipient opens / reads message)
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'read' } : m));
      if (onShowToast) {
        onShowToast('Read Receipt', `${activeThread.name} read your message ✓✓`, 'info');
      }
    }, 1400);

    // Simulate auto-reply after recipient reads message
    setTimeout(() => {
      setIsTyping(false);
      let replyText = `Received! *Direct chat* is connected.`;
      if (activeThread.id === 'thread_ai') {
        replyText = `✨ *MuniAI Answer*: Processed "${newMsg.text}". I formatted your answer with rich text formatting!`;
      } else if (activeThread.isGroup) {
        replyText = `Kai: Great input *${user.name}*! Checking the ~old~ ` + '`new pipeline`' + ` right now.`;
      } else {
        replyText = `Got it! I am reviewing *_your message_* right now. Speak soon! 🚀`;
      }

      const autoReplyMsg: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        senderId: activeThread.id,
        senderName: activeThread.isGroup ? 'Kai Takahashi' : activeThread.name,
        senderAvatar: activeThread.isGroup 
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
          : activeThread.avatar,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi: activeThread.id === 'thread_ai'
      };

      setMessages(prev => [...prev, autoReplyMsg]);
    }, 2400);
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    triggerHaptic('reaction');
    setActiveReactionPickerId(null);
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;

      const currentReactions = m.reactions || [];
      const existingReaction = currentReactions.find(r => r.emoji === emoji);

      let updatedReactions;
      if (existingReaction) {
        const hasUser = existingReaction.users.includes(user.id);
        if (hasUser) {
          // Remove user reaction
          const newUsers = existingReaction.users.filter(u => u !== user.id);
          if (newUsers.length === 0) {
            updatedReactions = currentReactions.filter(r => r.emoji !== emoji);
          } else {
            updatedReactions = currentReactions.map(r => r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r);
          }
        } else {
          // Add user reaction
          const newUsers = [...existingReaction.users, user.id];
          updatedReactions = currentReactions.map(r => r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r);
        }
      } else {
        // Create new reaction
        updatedReactions = [...currentReactions, { emoji, count: 1, users: [user.id] }];
      }

      return { ...m, reactions: updatedReactions };
    }));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    triggerHaptic('success');
    const newGroupThread: ChatThread = {
      id: `group_${Date.now()}`,
      name: `👥 ${groupName.trim()}`,
      username: groupName.toLowerCase().replace(/\s+/g, '_'),
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
      online: true,
      lastMessage: `Group created by ${user.name}`,
      time: 'Just now',
      unread: 0,
      verified: true,
      isGroup: true,
      members: [user.name, ...selectedGroupMembers]
    };

    setThreads(prev => [newGroupThread, ...prev]);
    setActiveThreadId(newGroupThread.id);
    setIsCreateGroupOpen(false);
    setGroupName('');

    if (onShowToast) {
      onShowToast('Group Created!', `Created group chat "${newGroupThread.name}" with ${newGroupThread.members?.length} members.`, 'success');
    }
  };

  const handleQuickAiDraft = (prompt: string) => {
    setInput(prompt);
  };

  const filteredThreads = threads.filter(t => 
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderReadReceipt = (status?: 'sending' | 'sent' | 'delivered' | 'read', timestamp?: string) => {
    const currentStatus = status || 'read';

    if (currentStatus === 'sending') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-indigo-200/90 font-mono" title="Sending message...">
          <Clock className="w-3 h-3 animate-spin text-indigo-200" />
          <span className="text-[9px]">Sending...</span>
        </span>
      );
    }

    if (currentStatus === 'sent') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-indigo-200/90 font-mono" title="Sent to server">
          <Check className="w-3.5 h-3.5 text-indigo-200" />
          <span className="text-[9px]">Sent</span>
        </span>
      );
    }

    if (currentStatus === 'delivered') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-indigo-200/90 font-mono" title={`Delivered to ${activeThread.name}`}>
          <CheckCheck className="w-3.5 h-3.5 text-indigo-200 opacity-80" />
          <span className="text-[9px]">Delivered</span>
        </span>
      );
    }

    return (
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onShowToast) {
            onShowToast('Read Receipt Details', `Message seen by ${activeThread.name} at ${timestamp || '10:42 AM'} (Double Checkmark ✓✓)`, 'info');
          }
        }}
        className="flex items-center gap-1 text-[10px] font-bold hover:opacity-90 transition-opacity"
        title={`Read & Seen by ${activeThread.name} at ${timestamp || '10:42 AM'}`}
      >
        <CheckCheck className="w-3.5 h-3.5 text-cyan-300 font-extrabold drop-shadow-sm" />
        <span className="bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 text-[9px] px-1 py-0.2 rounded font-mono font-bold tracking-tight shadow-sm flex items-center gap-1">
          Seen
        </span>
      </button>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-2 sm:py-4 px-2 sm:px-4 lg:px-6 min-h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Bar Header */}
      <div className={`p-3 sm:p-4 rounded-2xl border mb-3 flex items-center justify-between ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-base sm:text-xl text-slate-950 dark:text-white flex items-center gap-2">
              <span>MuniMessages Direct & Groups</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                End-to-End Encrypted
              </span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
              Direct chat, group messages, voice notes, and rich formatting support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCreateGroupOpen(true)}
            className="p-2 sm:p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>New Group</span>
          </button>
          <button 
            onClick={() => setActiveCall('video')}
            className="p-2 sm:p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-colors"
          >
            <Video className="w-4 h-4" />
            <span className="hidden md:inline">HD Call</span>
          </button>
        </div>
      </div>

      {/* Main Full-Screen Split Workspace */}
      <div className={`flex-1 grid grid-cols-1 md:grid-cols-12 rounded-3xl border overflow-hidden min-h-[550px] sm:min-h-[620px] ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        
        {/* Left Sidebar Conversations List */}
        <div className={`md:col-span-4 border-r flex flex-col ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        } ${
          isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
        }`}>
          {/* Search Contacts & New Group */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className={`relative flex items-center rounded-xl border px-3 py-1.5 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-950'
            }`}>
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search chats by name or text..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 text-xs focus:outline-none text-slate-950 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 font-semibold"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>Matching threads:</span>
                <span className="font-mono text-indigo-400 font-bold">{filteredThreads.length} found</span>
              </div>
            )}
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p className="font-bold">No chats match "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 text-[11px] font-bold"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isActive = thread.id === activeThreadId;

                return (
                  <button
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left relative ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                        : isDarkMode 
                          ? 'hover:bg-slate-800/80 text-slate-200' 
                          : 'hover:bg-slate-200/80 text-slate-950'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={thread.avatar} 
                        alt={thread.name} 
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" 
                      />
                      {thread.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-bold text-xs truncate flex items-center gap-1 ${isActive ? 'text-white' : 'text-slate-950 dark:text-slate-100'}`}>
                          <span>{thread.name}</span>
                          {thread.isGroup && <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Group</span>}
                        </span>
                        <span className={`text-[10px] font-mono ${isActive ? 'text-indigo-100' : 'text-slate-700 dark:text-slate-400 font-bold'}`}>
                          {thread.time}
                        </span>
                      </div>
                      <div className={`text-xs truncate flex items-center gap-1 min-w-0 ${isActive ? 'text-indigo-100' : 'text-slate-800 dark:text-slate-400 font-medium'}`}>
                        {thread.unread === 0 && (
                          <span title="Message read">
                            <CheckCheck className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-200' : 'text-cyan-500 dark:text-cyan-400'}`} />
                          </span>
                        )}
                        <FormattedText text={thread.lastMessage} inline={true} className="truncate min-w-0 flex-1" />
                      </div>
                    </div>

                    {thread.unread > 0 && !isActive && (
                      <span className="w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shrink-0 animate-pulse shadow-sm">
                        {thread.unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Window */}
        <div className={`md:col-span-8 flex-col h-full bg-transparent ${
          showMobileChat ? 'flex' : 'hidden md:flex'
        }`}>
          
          {/* Active Conversation Header */}
          <div className={`p-3.5 border-b flex items-center justify-between ${
            isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <img 
                  src={activeThread?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} 
                  alt={activeThread?.name || 'Chat'} 
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" 
                />
                {activeThread?.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-950 dark:text-white">{activeThread?.name || 'Conversation'}</h3>
                  {activeThread?.verified && <ShieldCheck className="w-4 h-4 text-indigo-400" />}
                </div>
                <div className="flex items-center gap-2">
                  {isTyping ? (
                    <span className="text-[11px] text-cyan-400 font-mono font-bold animate-pulse flex items-center gap-1">
                      <span>typing message</span>
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></span>
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-100"></span>
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-200"></span>
                      </span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {activeThread?.isGroup 
                        ? `Group • ${activeThread?.members?.length || 5} members` 
                        : activeThread?.online ? 'Online • Active now' : 'Offline'}
                    </span>
                  )}
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" title="Read receipts active for this chat">
                    <Eye className="w-3 h-3 text-cyan-400" /> Read Receipts On
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  triggerHaptic('light');
                  setIsTyping(!isTyping);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all ${
                  isTyping 
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 animate-pulse' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Test typing indicator animation"
              >
                {isTyping ? 'Typing...' : 'Simulate Typing'}
              </button>
              <button className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
            {messages.map((m) => {
              const isMe = m.senderId === user.id;
              const hasReactions = m.reactions && m.reactions.length > 0;

              return (
                <div key={m.id} className={`flex gap-2.5 group relative ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img 
                    src={m.senderAvatar} 
                    alt={m.senderName} 
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" 
                  />
                  
                  <div className="flex flex-col space-y-1 max-w-[80%] sm:max-w-[75%]">
                    {/* Hover Emoji Reaction Bar */}
                    <div className={`hidden group-hover:flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/95 border border-slate-700 shadow-xl backdrop-blur-md absolute -top-8 z-10 ${
                      isMe ? 'right-10' : 'left-10'
                    }`}>
                      {['❤️', '🔥', '👍', '😂', '😮', '👏', '🚀'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(m.id, emoji)}
                          className="hover:scale-130 active:scale-95 transition-transform p-0.5 text-xs"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className={`rounded-2xl p-3.5 text-xs space-y-1 shadow-sm relative ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : m.isAi 
                          ? isDarkMode 
                            ? 'bg-slate-950 border border-indigo-500/40 text-slate-100 rounded-tl-none' 
                            : 'bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-tl-none font-semibold'
                          : isDarkMode 
                            ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none' 
                            : 'bg-slate-100 border border-slate-200 text-slate-950 rounded-tl-none font-semibold'
                    }`}>
                      <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 mb-1">
                        <span className="font-bold">{m.senderName}</span>
                        <span className="font-mono text-[9px]">{m.timestamp}</span>
                      </div>
                      
                      {/* Render text with formatting */}
                      <FormattedText text={m.text} className="text-xs" />

                      {isMe && (
                        <div className="flex justify-end text-[10px] mt-1.5 pt-1 border-t border-white/10">
                          {renderReadReceipt(m.status, m.timestamp)}
                        </div>
                      )}
                    </div>

                    {/* Emoji Reaction Chips */}
                    {hasReactions && (
                      <div className={`flex flex-wrap gap-1.5 pt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {m.reactions?.map((r, idx) => {
                          const userReacted = r.users.includes(user.id);
                          return (
                            <button
                              key={idx}
                              onClick={() => handleToggleReaction(m.id, r.emoji)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold border transition-all ${
                                userReacted 
                                  ? 'bg-indigo-600/30 border-indigo-400/60 text-indigo-300 ring-1 ring-indigo-400/30' 
                                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{r.emoji}</span>
                              <span className="text-[10px] font-mono">{r.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Real-time typing animation bubble */}
            {isTyping && (
              <div className="flex gap-2.5 items-end">
                <img 
                  src={activeThread.avatar} 
                  alt={activeThread.name} 
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-indigo-500/40" 
                />
                <div className="px-4 py-2.5 rounded-2xl rounded-tl-none bg-slate-900 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2 shadow-md">
                  <span className="text-[11px] font-medium opacity-80">{activeThread.name} is typing</span>
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className={`p-3 border-t flex items-center gap-2 ${
            isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
          }`}>
            <button 
              type="button" 
              onClick={() => {
                setInput(prev => prev + ' 📸 [Attached Image] ');
                if (onShowToast) onShowToast('Attachment Added', 'Attached photo to message', 'info');
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Attach File / Photo"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button 
              type="button" 
              onClick={() => {
                setIsRecordingVoice(!isRecordingVoice);
                if (!isRecordingVoice) {
                  setVoiceSeconds(0);
                  const timer = setInterval(() => {
                    setVoiceSeconds(s => s + 1);
                  }, 1000);
                  setTimeout(() => clearInterval(timer), 5000);
                }
              }}
              className={`p-2 rounded-xl transition-colors shrink-0 ${
                isRecordingVoice 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>

            {isRecordingVoice ? (
              <div className="flex-1 px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center justify-between">
                <span>Recording voice note... 00:0{voiceSeconds}</span>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsRecordingVoice(false);
                    setInput('🎙️ [Voice Note 00:05] Click to play audio');
                  }}
                  className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
                >
                  Attach Note
                </button>
              </div>
            ) : (
              <input
                type="text"
                placeholder={`Message ${activeThread.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs text-slate-950 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'
                }`}
              />
            )}

            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold shadow-md shadow-indigo-600/30 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

      {/* New Group Creation Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-heading font-extrabold text-base">Create Group Chat</h3>
              </div>
              <button onClick={() => setIsCreateGroupOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🚀 MuniSocial AI Lab Group"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Members</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {AVAILABLE_CONTACTS.map((contact, idx) => {
                    const isSelected = selectedGroupMembers.includes(contact.name);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGroupMembers(prev => prev.filter(m => m !== contact.name));
                          } else {
                            setSelectedGroupMembers(prev => [...prev, contact.name]);
                          }
                        }}
                        className={`w-full p-2 rounded-xl flex items-center justify-between border text-xs text-left transition-all ${
                          isSelected 
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-white' 
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={contact.avatar} 
                            alt={contact.name} 
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                            className="w-7 h-7 rounded-full object-cover" 
                          />
                          <div>
                            <span className="font-bold block">{contact.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">@{contact.username}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!groupName.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                Create Group Chat
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HD Call Simulator Modal */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center text-white space-y-5 shadow-2xl">
            <div className="relative w-24 h-24 rounded-full bg-emerald-600/30 mx-auto flex items-center justify-center border-2 border-emerald-400 animate-pulse">
              <img 
                src={activeThread.avatar} 
                alt={activeThread.name} 
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }}
                className="w-20 h-20 rounded-full object-cover" 
              />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xl">
                Calling {activeThread.name}...
              </h3>
              <p className="text-xs text-emerald-400 font-mono mt-1">
                MuniCall WebRTC 4K HD {activeCall === 'video' ? '1080p Video' : 'Crisp Voice'} Stream
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button className="p-3.5 rounded-full bg-slate-800 text-white hover:bg-slate-700">
                <MicOff className="w-5 h-5" />
              </button>
              <button className="p-3.5 rounded-full bg-slate-800 text-white hover:bg-slate-700">
                <VideoOff className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveCall(null)}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/40"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

