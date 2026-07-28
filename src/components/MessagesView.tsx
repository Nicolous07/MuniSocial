import React, { useState } from 'react';
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
  VideoOff,
  MicOff,
  Users,
  Plus,
  X,
  Code,
  Smile,
  Hash
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { FormattedText } from './FormattedText';

interface MessagesViewProps {
  initialMessages: ChatMessage[];
  user: UserProfile;
  isDarkMode: boolean;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'alert' | 'error') => void;
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
  onShowToast
}) => {
  const [activeThreadId, setActiveThreadId] = useState<string>('thread_1');
  const [threads, setThreads] = useState<ChatThread[]>(CONVERSATIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCall, setActiveCall] = useState<'audio' | 'video' | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);

  // Group Creation Modal State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>(['Elena Rostova', 'Kai Takahashi']);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    if (onShowToast) {
      onShowToast('Message Sent', `Delivered to ${activeThread.name}`, 'success');
    }

    // Update last message in thread
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, lastMessage: newMsg.text, time: 'Just now' } : t));

    // Simulate auto-reply
    setTimeout(() => {
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
    }, 1200);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

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
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                placeholder="Search direct chats or groups..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 text-xs focus:outline-none text-slate-950 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 font-semibold"
              />
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {filteredThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;

              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left relative ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : isDarkMode 
                        ? 'hover:bg-slate-800/80 text-slate-200' 
                        : 'hover:bg-slate-200/80 text-slate-950'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={thread.avatar} alt={thread.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
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
                    <div className={`text-xs truncate ${isActive ? 'text-indigo-100' : 'text-slate-800 dark:text-slate-400 font-medium'}`}>
                      <FormattedText text={thread.lastMessage} />
                    </div>
                  </div>

                  {thread.unread > 0 && !isActive && (
                    <span className="w-5 h-5 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {thread.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Chat Window */}
        <div className="md:col-span-8 flex flex-col h-full bg-transparent">
          
          {/* Active Conversation Header */}
          <div className={`p-3.5 border-b flex items-center justify-between ${
            isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={activeThread.avatar} alt={activeThread.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
                {activeThread.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-950 dark:text-white">{activeThread.name}</h3>
                  {activeThread.verified && <ShieldCheck className="w-4 h-4 text-indigo-400" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {activeThread.isGroup 
                    ? `Group • ${activeThread.members?.length || 5} members` 
                    : activeThread.online ? 'Online • Active now' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/40">
            {messages.map((m) => {
              const isMe = m.senderId === user.id;

              return (
                <div key={m.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img src={m.senderAvatar} alt={m.senderName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                  <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs space-y-1 shadow-sm ${
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
                      <div className="flex justify-end text-[10px] opacity-80 mt-1">
                        <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                          <img src={contact.avatar} alt={contact.name} className="w-7 h-7 rounded-full object-cover" />
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
              <img src={activeThread.avatar} alt={activeThread.name} className="w-20 h-20 rounded-full object-cover" />
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

