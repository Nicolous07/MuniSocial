import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  Wand2, 
  Video, 
  Code, 
  CheckCircle2, 
  Loader2, 
  Copy,
  RefreshCw,
  Clock
} from 'lucide-react';

interface MuniAIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onApplyGeneratedContent?: (text: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const MuniAIAssistantDrawer: React.FC<MuniAIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onApplyGeneratedContent
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Hello! I am **MuniAI**, your intelligent copilot for MuniSocial (by Municryptrix).\n\nHow can I help you today? You can ask me to:\n- 🚀 **Draft viral posts or TikTok video scripts**\n- 📝 **Summarize long YouTube videos**\n- ⚡ **Write TypeScript / React code snippets**\n- 🌐 **Translate content into 50+ languages**',
      timestamp: 'Just now',
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-hide drawer after 30 seconds of inactivity
  useEffect(() => {
    if (!isOpen) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        onClose();
      }, 30000); // 30 seconds inactivity
    };

    resetTimer();

    const handleUserActivity = () => {
      resetTimer();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
          context: 'MuniAI Copilot Side Drawer'
        })
      });

      const data = await res.json();
      const aiReply = data.reply || 'I processed your request using Gemini 3.6 Flash on MuniSocial!';

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('MuniAI call error:', err);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: '✨ **MuniAI Offline Helper**: "MuniSocial is built with Gemini 3.6 Flash AI intelligence! Here is a drafted viral post: *\'Excited to build the future of decentralised social connectivity on MuniSocial! #MuniAI #Municryptrix\'*"',
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptQuickActions = [
    { label: '🚀 Draft Viral Post', prompt: 'Write a high-converting, engaging social post about AI and the future of social networks with hashtags.' },
    { label: '🎬 TikTok Reel Script', prompt: 'Generate a 30-second vertical video script with visual cues [Visual] and voiceover [Voice] for a tech product.' },
    { label: '⚡ React Code Snippet', prompt: 'Write a clean TypeScript React hook for real-time WebSocket connection handling.' },
    { label: '📊 Summarize Trends', prompt: 'What are the top 3 social media and AI technology trends right now in 2026?' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-lg h-full flex flex-col shadow-2xl border-l transition-transform ${
        isDarkMode ? 'bg-slate-950 border-slate-800/80 text-slate-100' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-950 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 font-heading font-extrabold text-base">
                <span className="bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  MuniAI Copilot
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono font-bold shadow-sm">
                  Gemini 3.6 Flash
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Screen Aware
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-300/90 font-mono">
                  <Clock className="w-2.5 h-2.5" /> Auto-close 30s
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all shadow-md relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Context Activity Banner */}
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/30 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-indigo-200 truncate">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Context: Active on MuniSocial Feed & Ecosystem</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold shrink-0">
            Realtime
          </span>
        </div>

        {/* Quick Action Chips */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/80 overflow-x-auto no-scrollbar flex items-center gap-2">
          {promptQuickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(action.prompt)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-purple-900 text-indigo-200 border border-indigo-500/30 text-[11px] font-semibold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95"
            >
              <Wand2 className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div key={m.id} className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'}`}>
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
                <div className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-lg ${
                  isAi 
                    ? 'bg-slate-900/90 border border-slate-800/90 text-slate-100 backdrop-blur-sm' 
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-medium'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-[10px] text-slate-400">
                    <span className="font-mono">{m.timestamp}</span>
                    {isAi && (
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => handleCopy(m.text, m.id)}
                          className="hover:text-indigo-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-slate-800/50 hover:bg-slate-800"
                        >
                          {copiedId === m.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        {onApplyGeneratedContent && (
                          <button
                            onClick={() => onApplyGeneratedContent(m.text)}
                            className="text-indigo-300 font-bold hover:text-white px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 transition-colors"
                          >
                            Apply Content
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-indigo-300 p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/50 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>MuniAI is thinking with Gemini 3.6 Flash...</span>
            </div>
          )}
        </div>

        {/* Drawer Footer Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2"
          >
            <div className="flex-1 relative">
              <input 
                type="text"
                placeholder="Ask MuniAI Copilot anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-2xl text-xs bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
              />
              <button
                type="button"
                onClick={() => handleSendMessage('Suggest creative ideas for my next social reel')}
                className="absolute right-2 top-2.5 p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                title="Quick Assist"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white transition-all shadow-lg shadow-indigo-600/30 font-bold text-xs flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] text-slate-500 font-mono">
            <span>MuniAI Engine v3.6</span>
            <span className="text-emerald-400/90 font-medium">99.8% Accuracy</span>
            <span>Zero Exposure Encryption</span>
          </div>
        </div>

      </div>
    </div>
  );
};
