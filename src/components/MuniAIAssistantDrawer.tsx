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
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg h-full flex flex-col shadow-2xl border-l transition-transform ${
        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-indigo-950/30 to-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-heading font-bold text-base">
                <span>MuniAI Assistant</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.2 rounded-full font-mono">
                  Gemini 3.6
                </span>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded-full font-mono flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> Auto-close 30s
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Powered by Municryptrix Intelligence</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Chips */}
        <div className="p-3 border-b border-slate-800/60 bg-slate-900/30 overflow-x-auto no-scrollbar flex items-center gap-2">
          {promptQuickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(action.prompt)}
              className="px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
            >
              <Wand2 className="w-3 h-3 text-indigo-400" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div key={m.id} className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'}`}>
                {isAi && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  isAi 
                    ? isDarkMode 
                      ? 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md' 
                      : 'bg-slate-100 text-slate-800 shadow-sm'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/30 text-[10px] text-slate-400">
                    <span>{m.timestamp}</span>
                    {isAi && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleCopy(m.text, m.id)}
                          className="hover:text-indigo-400 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === m.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        {onApplyGeneratedContent && (
                          <button
                            onClick={() => onApplyGeneratedContent(m.text)}
                            className="text-indigo-400 font-semibold hover:underline"
                          >
                            Use in Creator
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
            <div className="flex gap-3 items-center text-xs text-indigo-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>MuniAI is generating response with Gemini 3.6 Flash...</span>
            </div>
          )}
        </div>

        {/* Drawer Footer Input */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2"
          >
            <input 
              type="text"
              placeholder="Ask MuniAI to generate, summarize, or analyze..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-500 text-center mt-2 font-mono">
            MuniAI v3.5 • Municryptrix AI Architecture • Zero Exposure Privacy
          </p>
        </div>

      </div>
    </div>
  );
};
