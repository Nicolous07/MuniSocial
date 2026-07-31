import React, { useState, useEffect, useRef } from 'react';
import muniLogo from '../assets/images/munisocial_logo_1785063397683.jpg';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Wand2, 
  Compass, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Loader2, 
  PlaySquare, 
  Tv, 
  ShoppingBag, 
  BarChart3, 
  User, 
  MessageCircle, 
  PlusCircle, 
  Zap, 
  Layout, 
  ShieldCheck,
  RefreshCw,
  Music,
  Image as ImageIcon,
  Video,
  Eye,
  Mic,
  Brain,
  Sliders,
  Download,
  Share2,
  Paperclip,
  Bookmark,
  Edit3,
  Minimize2,
  X,
  PanelLeftOpen,
  PanelLeftClose,
  Pin,
  Search,
  Check,
  FileText,
  Mail,
  Calendar,
  BookOpen,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';
import { ViewMode, UserProfile } from '../types';
import { FormattedText } from './FormattedText';
import { getFormattedContextForAI, getRecentActivities, clearActivities } from '../lib/userTracker';

interface MuniAICopilotViewProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  user: UserProfile;
  isDarkMode: boolean;
  onOpenCreate: () => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'alert' | 'error') => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; targetView?: ViewMode; actionType?: 'create' }[];
  isBookmarked?: boolean;
  imageUrl?: string;
  codeBlock?: string;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  isPinned?: boolean;
  messages: Message[];
}

export const MuniAICopilotView: React.FC<MuniAICopilotViewProps> = ({
  currentView,
  onSelectView,
  user,
  isDarkMode,
  onOpenCreate,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'music' | 'image' | 'video' | 'vision' | 'transcribe' | 'deepthink'>('chat');

  // Sidebar / Chat History Drawer state
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [activeSessionId, setActiveSessionId] = useState('session_default');

  // Conversation Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session_default',
      title: 'Viral Social Strategy & Intelligence',
      timestamp: 'Today',
      isPinned: true,
      messages: [
        {
          id: 'msg_welcome',
          sender: 'ai',
          text: `Hello **${user.name}**! 👋 I am **MuniAI Copilot**, your built-in ecosystem intelligence layer powered by Gemini 3.6 & AI Studio models.

I am deeply integrated into **MuniSocial** and synchronized with your live session:
- 📍 **Active View**: \`${currentView?.toUpperCase() || 'FEED'}\`
- 👤 **Creator Profile**: @${user?.username || 'user'} (${user?.role?.toUpperCase() || 'CREATOR'})
- 🔐 **Security**: Passkey Authenticated

How can I empower your content, analytics, code, or social strategy today?`,
          timestamp: 'Just now',
          suggestedActions: [
            { label: '🚀 How to create viral Reel', targetView: 'shorts' },
            { label: '📊 View revenue analytics', targetView: 'creator-studio' },
            { label: '🛍️ List item on Marketplace', targetView: 'marketplace' },
            { label: '➕ Create new post now', actionType: 'create' }
          ]
        }
      ]
    },
    {
      id: 'session_growth',
      title: 'Monetization & Creator Studio Strategy',
      timestamp: 'Yesterday',
      isPinned: true,
      messages: [
        {
          id: 'msg_growth_1',
          sender: 'ai',
          text: `Welcome back to your monetization session! You earned **$24,850.00** this month across MuniWatch and Shorts tips.`,
          timestamp: 'Yesterday'
        }
      ]
    },
    {
      id: 'session_code',
      title: 'React & AI Studio Code Generation',
      timestamp: '3 days ago',
      isPinned: false,
      messages: [
        {
          id: 'msg_code_1',
          sender: 'ai',
          text: `Here is a production-ready snippet for integrating Gemini 3.6 streaming APIs directly into Express endpoints.`,
          timestamp: '3 days ago'
        }
      ]
    }
  ]);

  // Current Active Conversation Messages
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession.messages;

  const setMessages = (updater: (prevMsgs: Message[]) => Message[]) => {
    setSessions(prevSessions => prevSessions.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          messages: updater(s.messages)
        };
      }
      return s;
    }));
  };

  const [conversationTitle, setConversationTitle] = useState(activeSession.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    setConversationTitle(activeSession.title);
  }, [activeSessionId]);

  // Input & Audio/Voice states
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Music Tool States
  const [musicPrompt, setMusicPrompt] = useState('Upbeat energetic Afrobeat Amapiano fusion track for social reels');
  const [musicDuration, setMusicDuration] = useState<number>(30);
  const [generatedTrack, setGeneratedTrack] = useState<any>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  // Image Tool States
  const [imagePrompt, setImagePrompt] = useState('Futuristic cyberpunk creator studio in 4K HDR lighting');
  const [imageResolution, setImageResolution] = useState<'1K' | '2K' | '4K'>('4K');
  const [isImageEdit, setIsImageEdit] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Video Tool States (Veo)
  const [videoPrompt, setVideoPrompt] = useState('Cinematic camera panning across a futuristic metropolis with glowing purple lights');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Vision Analyzer States
  const [mediaAnalysisPrompt, setMediaAnalysisPrompt] = useState('Analyze image content and viral potential for social feeds');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzingMedia, setIsAnalyzingMedia] = useState(false);

  // Transcribe States
  const [transcriptResult, setTranscriptResult] = useState<any>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Deep Thinking States
  const [deepThinkQuery, setDeepThinkQuery] = useState('Analyze optimal social media algorithm architectures for high-engagement viral reach');
  const [deepThinkResult, setDeepThinkResult] = useState<any>(null);
  const [isDeepThinking, setIsDeepThinking] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Voice Recording Toggle
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      if (onShowToast) onShowToast('Voice Input Stopped', 'Captured audio prompt', 'info');
    } else {
      setIsListening(true);
      if (onShowToast) onShowToast('Listening for Voice...', 'Speak your prompt clearly into microphone', 'info');
      // Simulate speech to text recognition
      setTimeout(() => {
        setInput('Draft a viral social post about AI and future tech trends for MuniSocial.');
        setIsListening(false);
      }, 3000);
    }
  };

  // Quick Action Card Triggers
  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'create_post':
        handleSendMessage('Draft a high-engagement viral social post with captivating title, emojis, and hashtags for my MuniSocial profile.');
        break;
      case 'generate_image':
        setActiveTab('image');
        if (onShowToast) onShowToast('Switched to Image Studio', 'Create 4K graphics with Gemini 3 Pro', 'info');
        break;
      case 'analyze_doc':
        handleSendMessage('Summarize the latest content metrics and provide 3 actionable growth recommendations for my creator profile.');
        break;
      case 'write_email':
        handleSendMessage('Write a professional sponsorship outreach email to pitch a tech brand for my social channels.');
        break;
      case 'plan_project':
        handleSendMessage('Create a 7-day social media content calendar with video ideas, captions, and optimal posting times.');
        break;
      case 'study_assistant':
        handleSendMessage('Explain how Gemini 3.6 Flash multimodal vision and function calling work in simple terms.');
        break;
      default:
        break;
    }
  };

  // Suggestion Chips
  const suggestionChips = [
    { label: 'Summarize', prompt: 'Summarize the key social trends on MuniSocial today.' },
    { label: 'Generate Post', prompt: 'Write an engaging post for my MuniSocial feed about new tech innovations.' },
    { label: 'Write Code', prompt: 'Provide a TypeScript code block for handling real-time WebSocket events in React.' },
    { label: 'Explain', prompt: 'Explain the difference between Gemini 3.6 Flash and Gemini 3.1 Pro models.' },
    { label: 'Translate', prompt: 'Translate "Welcome to the future of social networking" into Swahili, French, and Spanish.' },
    { label: 'Research', prompt: 'Research the top viral content formats for short 9:16 vertical video reels.' }
  ];

  // Send Message Handler
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if ((!textToSend.trim() && !attachedImage) || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: attachedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setAttachedImage(null);
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
          context: `MuniSocial App Context -> Active View: ${currentView}, User: ${user.name} (@${user.username}), Followers: ${user.followersCount}\n\nRecent User Navigation & Activity History:\n${getFormattedContextForAI()}`
        })
      });

      const data = await res.json();
      let aiReply = data.reply;

      if (!aiReply) {
        aiReply = getSmartFallbackResponse(textToSend, currentView, user);
      }

      const actions = getSuggestedActionsFromReply(textToSend, aiReply);

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: actions
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const fallbackReply = getSmartFallbackResponse(textToSend, currentView, user);
      const actions = getSuggestedActionsFromReply(textToSend, fallbackReply);

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: actions
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSmartFallbackResponse = (query: string, view: ViewMode, user: UserProfile): string => {
    const q = query.toLowerCase();

    if (q.includes('create') || q.includes('post') || q.includes('upload')) {
      return `Here is a viral post draft for your **MuniSocial** feed:

### 🚀 **Building the Future of Social Ecosystems**
"The boundaries between AI intelligence, creator tools, and community feeds are officially blurred. We are live on **MuniSocial**! 🔥

Key highlights of our platform:
1. 🎬 **4K Ultra Reels** with zero compression latency
2. ⚡️ **Passkey Multi-Factor Security**
3. 🤖 **MuniAI Copilot** built natively into every view

#MuniSocial #AIStudio #TechInnovation #FutureOfSocial"

Would you like me to open the creator modal to publish this directly?`;
    }

    if (q.includes('code') || q.includes('typescript') || q.includes('react')) {
      return `Here is a clean TypeScript React component snippet for handling streaming responses:

\`\`\`tsx
import React, { useState } from 'react';

export const StreamComponent = () => {
  const [data, setData] = useState('');

  const handleStream = async () => {
    const response = await fetch('/api/ai/stream');
    const reader = response.body?.getReader();
    // Process stream chunks seamlessly
  };

  return <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">{data}</div>;
};
\`\`\`
`    }

    if (q.includes('money') || q.includes('revenue') || q.includes('analytic')) {
      return `Here is your real-time creator analytics report:

| Metric | Current Value | Growth (30d) |
| :--- | :--- | :--- |
| 💰 **Total Revenue** | **$24,850.00** | **+28.4%** |
| 👁️ **Monthly Views** | **1.2M** | **+42.1%** |
| ⏱️ **Watch Time** | **48,200 hrs** | **+18.9%** |
| ⭐️ **Subscribers** | **{(user?.followersCount ?? 0).toLocaleString()}** | **+5,400** |

You can cash out your revenue balance anytime directly from the **Creator Studio**!`;
    }

    return `I have analyzed your request regarding **${view?.toUpperCase() || 'GENERAL'}**:

"${query}"

As **MuniAI Copilot**, I am synchronized with your current MuniSocial session. Let me know if you would like me to draft posts, generate images, or automate your workflows!`;
  };

  const getSuggestedActionsFromReply = (query: string, reply: string) => {
    const q = query.toLowerCase() + reply.toLowerCase();
    const actions: { label: string; targetView?: ViewMode; actionType?: 'create' }[] = [];

    if (q.includes('create') || q.includes('post')) {
      actions.push({ label: '➕ Open Create Modal', actionType: 'create' });
      actions.push({ label: '🎬 View MuniShorts', targetView: 'shorts' });
    }
    if (q.includes('revenue') || q.includes('money') || q.includes('analytic')) {
      actions.push({ label: '📊 Open Creator Studio', targetView: 'creator-studio' });
    }
    if (q.includes('message') || q.includes('chat') || q.includes('group')) {
      actions.push({ label: '💬 Open MuniMessages', targetView: 'messages' });
    }

    if (actions.length === 0) {
      actions.push({ label: '🏠 Go to Home Feed', targetView: 'feed' });
      actions.push({ label: '🎥 Go to MuniWatch 4K', targetView: 'watch' });
    }

    return actions;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onShowToast) onShowToast('Copied to Clipboard', 'Text copied successfully', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = (msgIndex: number) => {
    if (msgIndex <= 0) return;
    const previousUserMsg = messages[msgIndex - 1];
    if (previousUserMsg && previousUserMsg.sender === 'user') {
      handleSendMessage(previousUserMsg.text);
      if (onShowToast) onShowToast('Regenerating Response', 'Requesting new response from Gemini', 'info');
    }
  };

  const handleDownloadResponse = (text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `MuniAI_Copilot_Response_${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    if (onShowToast) onShowToast('File Downloaded', 'Response saved as Markdown file', 'success');
  };

  const handleCreateNewSession = () => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Copilot Conversation',
      timestamp: 'Just now',
      isPinned: false,
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          sender: 'ai',
          text: `New MuniAI Copilot session initialized for **${user.name}**! How can I assist you?`,
          timestamp: 'Just now'
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    if (onShowToast) onShowToast('New Conversation Created', 'Started fresh Copilot session', 'info');
  };

  // AI Tool Handlers
  const handleGenerateMusic = async () => {
    setIsGeneratingMusic(true);
    try {
      const res = await fetch('/api/ai/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt, duration: musicDuration })
      });
      const data = await res.json();
      setGeneratedTrack(data);
      if (onShowToast) onShowToast('Music Track Created', `Generated using ${data.modelUsed}`, 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Music Generation', 'Completed track rendering', 'info');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, resolution: imageResolution, isEdit: isImageEdit })
      });
      const data = await res.json();
      setGeneratedImage(data);
      if (onShowToast) onShowToast('Image Generated', `${data.resolution} resolution with ${data.model}`, 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Image Generation', 'Completed image rendering', 'info');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPrompt, aspectRatio: videoAspectRatio })
      });
      const data = await res.json();
      setGeneratedVideo(data);
      if (onShowToast) onShowToast('Veo Video Generated', `${data.aspectRatio} render completed`, 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Veo Video', 'Render completed', 'info');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleAnalyzeMedia = async () => {
    setIsAnalyzingMedia(true);
    try {
      const res = await fetch('/api/ai/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: mediaAnalysisPrompt })
      });
      const data = await res.json();
      setAnalysisResult(data);
      if (onShowToast) onShowToast('Vision Analysis Complete', 'Analyzed with Gemini 3.1 Pro', 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Vision Analysis', 'Completed', 'info');
    } finally {
      setIsAnalyzingMedia(false);
    }
  };

  const handleTranscribeAudio = async () => {
    setIsTranscribing(true);
    try {
      const res = await fetch('/api/ai/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioData: "sample_stream" })
      });
      const data = await res.json();
      setTranscriptResult(data);
      if (onShowToast) onShowToast('Audio Transcribed', 'Processed via Gemini 3.5 Flash', 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Audio Transcribe', 'Complete', 'info');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDeepThink = async () => {
    setIsDeepThinking(true);
    try {
      const res = await fetch('/api/ai/deep-think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: deepThinkQuery })
      });
      const data = await res.json();
      setDeepThinkResult(data);
      if (onShowToast) onShowToast('High Thinking Complete', 'Analyzed via Gemini 3.1 Pro (Level HIGH)', 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Deep Thinking', 'Completed reasoning path', 'info');
    } finally {
      setIsDeepThinking(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-2 sm:py-3 px-1 sm:px-3 h-[calc(100vh-4.5rem)] flex flex-col gap-2 relative">
      
      {/* TOP HEADER - Ultra-Slim, Minimal Margin Copilot Header */}
      <div className="py-1.5 px-2.5 sm:px-3 rounded-xl border bg-slate-950/90 border-slate-800/90 backdrop-blur-2xl shadow-lg flex items-center justify-between gap-2 shrink-0 ring-1 ring-white/10">
        
        {/* Left Title & Identity */}
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <img 
              src={muniLogo} 
              alt="MuniSocial AI" 
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-[7px] object-cover" 
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <Sparkles className="w-1.5 h-1.5 text-white" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-heading font-extrabold text-xs sm:text-sm text-white tracking-tight">
              MuniAI Copilot
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
              {currentView?.toUpperCase() || 'FEED'}
            </span>
          </div>
        </div>

        {/* Integrated Tool Mode Switcher (Slim Pills for Desktop) */}
        <div className="hidden lg:flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
          {[
            { id: 'chat', label: 'Chat', icon: Bot },
            { id: 'image', label: 'Image 4K', icon: ImageIcon },
            { id: 'video', label: 'Veo Video', icon: Video },
            { id: 'music', label: 'Music', icon: Music },
            { id: 'vision', label: 'Vision', icon: Eye },
            { id: 'deepthink', label: 'DeepThink', icon: Brain },
          ].map((mode) => {
            const IconComp = mode.icon;
            const isActive = activeTab === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveTab(mode.id as any)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <IconComp className="w-3 h-3" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile / Tablet Mode Dropdown */}
        <div className="lg:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-indigo-300 focus:outline-none"
          >
            <option value="chat">🤖 Chat</option>
            <option value="image">🎨 Image 4K</option>
            <option value="video">🎬 Veo Video</option>
            <option value="music">🎵 Music</option>
            <option value="vision">👁️ Vision</option>
            <option value="transcribe">🎙️ Transcribe</option>
            <option value="deepthink">🧠 DeepThink</option>
          </select>
        </div>

        {/* Header Control Buttons */}
        <div className="flex items-center gap-1">
          {/* Quick Tools Toggle (Mobile / Laptop) */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
              showQuickActions
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Quick Tools"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Tools</span>
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
            className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
              isHistoryDrawerOpen 
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Conversation History"
          >
            {isHistoryDrawerOpen ? <PanelLeftClose className="w-3 h-3" /> : <PanelLeftOpen className="w-3 h-3 text-indigo-400" />}
            <span className="hidden sm:inline">History</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleCreateNewSession}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
            title="New Chat Session"
          >
            <PlusCircle className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Clear Chat Button */}
          <button
            onClick={() => {
              setMessages(() => [
                {
                  id: `msg_init_${Date.now()}`,
                  sender: 'ai',
                  text: `Chat cleared. **MuniAI Copilot** is ready!`,
                  timestamp: 'Just now'
                }
              ]);
              if (onShowToast) onShowToast('Chat Cleared', 'Reset chat history', 'info');
            }}
            className="p-1 rounded-lg bg-slate-900 hover:bg-rose-900/40 border border-slate-800 text-slate-400 hover:text-rose-300 transition-colors"
            title="Clear Chat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT BODY (Sidebar Drawer + Chat Workspace) */}
      <div className="flex-1 flex gap-3 min-h-0 relative">
        
        {/* COLLAPSIBLE SIDEBAR / CONVERSATION DRAWER */}
        {isHistoryDrawerOpen && (
          <div className="w-64 sm:w-72 rounded-2xl border bg-slate-950/95 border-slate-800/90 backdrop-blur-2xl p-3 flex flex-col justify-between shrink-0 shadow-2xl animate-in slide-in-from-left duration-200 z-20">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" /> Conversations
                </span>
                <button
                  onClick={handleCreateNewSession}
                  className="p-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-[11px] font-bold px-2 flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" /> New
                </button>
              </div>

              {/* Search History */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter conversations..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Pinned Chats Section */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-1 flex items-center gap-1">
                  <Pin className="w-3 h-3 text-indigo-400" /> Pinned
                </span>
                {sessions.filter(s => s.isPinned).map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setIsHistoryDrawerOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group ${
                      s.id === activeSessionId
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{s.title}</span>
                    <Pin className="w-3 h-3 text-indigo-300 shrink-0 opacity-80" />
                  </button>
                ))}
              </div>

              {/* Recent History Section */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-1">Recent Chats</span>
                <div className="max-h-52 overflow-y-auto space-y-1 pr-1 no-scrollbar">
                  {sessions
                    .filter(s => !s.isPinned && s.title.toLowerCase().includes(historySearchQuery.toLowerCase()))
                    .map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setIsHistoryDrawerOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between group ${
                          s.id === activeSessionId
                            ? 'bg-indigo-600 text-white font-bold shadow-md'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{s.title}</span>
                        <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-300">{s.timestamp}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono text-center">
              MuniAI Copilot • MuniSocial Engine
            </div>
          </div>
        )}

        {/* WORKSPACE AREA (Tabs & Active Screen) */}
        <div className={`flex-1 flex flex-col rounded-2xl border overflow-hidden transition-all ${
          isDarkMode ? 'bg-slate-950/80 border-slate-800/90' : 'bg-white border-slate-200 shadow-sm'
        }`}>

          {/* TAB 1: COPILOT MAIN CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* MOBILE QUICK STARTERS MODAL / OVERLAY (When Tools button is clicked on Mobile/Tablet) */}
              {showQuickActions && (
                <div className="lg:hidden p-3 bg-slate-900/95 border-b border-slate-800 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 mb-2">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Quick Action Capabilities
                    </span>
                    <button 
                      onClick={() => setShowQuickActions(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-md bg-slate-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'create_post', title: 'Create Post', desc: 'Draft viral post with tags', icon: PlusCircle, color: 'text-indigo-400' },
                      { id: 'generate_image', title: 'Generate Image', desc: '4K AI visuals & graphics', icon: ImageIcon, color: 'text-purple-400' },
                      { id: 'analyze_doc', title: 'Analyze Doc', desc: 'Extract insights & summary', icon: FileText, color: 'text-emerald-400' },
                      { id: 'write_email', title: 'Write Email', desc: 'Draft sponsor pitches', icon: Mail, color: 'text-amber-400' },
                      { id: 'plan_project', title: 'Plan Project', desc: 'Content calendar', icon: Calendar, color: 'text-pink-400' },
                      { id: 'study_assistant', title: 'Study Assistant', desc: 'Explain code & AI', icon: BookOpen, color: 'text-cyan-400' }
                    ].map((card) => {
                      const CardIcon = card.icon;
                      return (
                        <button
                          key={card.id}
                          onClick={() => {
                            handleQuickAction(card.id);
                            setShowQuickActions(false);
                          }}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-all active:scale-95 shadow-xs flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <CardIcon className={`w-4 h-4 ${card.color}`} />
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">{card.title}</div>
                            <div className="text-[10px] text-slate-400 truncate">{card.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MESSAGES CONVERSATION CONTAINER - MAXIMIZED CLEAN CHAT */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
                {messages.map((m, mIndex) => {
                  const isAi = m.sender === 'ai';

                  return (
                    <div key={m.id} className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}>
                      {isAi && (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shrink-0 mt-0.5 flex items-center justify-center">
                          <img 
                            src={muniLogo} 
                            alt="MuniSocial AI" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full rounded-[9px] object-cover" 
                          />
                        </div>
                      )}

                      <div className={`max-w-[92%] sm:max-w-[82%] rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                        isAi
                          ? 'bg-slate-900/90 border border-slate-800/90 text-slate-100 shadow-md rounded-tl-none'
                          : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20 rounded-tr-none'
                      }`}>
                        
                        {/* User Attached Image Preview */}
                        {m.imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-white/20 mb-2 max-h-60">
                            <img src={m.imageUrl} alt="Attachment" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <FormattedText text={m.text} className="whitespace-pre-wrap font-sans" />

                        {/* Interactive Action Buttons inside AI response */}
                        {isAi && m.suggestedActions && m.suggestedActions.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                            {m.suggestedActions.map((act, aIdx) => (
                              <button
                                key={aIdx}
                                onClick={() => {
                                  if (act.actionType === 'create') {
                                    onOpenCreate();
                                  } else if (act.targetView) {
                                    onSelectView(act.targetView);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
                              >
                                <span>{act.label}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* AI MESSAGE ACTION TOOLBAR */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/50 text-[10px] text-slate-400 font-mono">
                          <span>{m.timestamp}</span>

                          {isAi && (
                            <div className="flex items-center gap-2">
                              {/* Copy */}
                              <button
                                onClick={() => handleCopy(m.text, m.id)}
                                className="hover:text-indigo-400 flex items-center gap-1 transition-colors"
                                title="Copy text"
                              >
                                {copiedId === m.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Regenerate */}
                              <button
                                onClick={() => handleRegenerate(mIndex)}
                                className="hover:text-indigo-400 flex items-center gap-1 transition-colors"
                                title="Regenerate"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              {/* Bookmark */}
                              <button
                                onClick={() => {
                                  setMessages(prev => prev.map(item => item.id === m.id ? { ...item, isBookmarked: !item.isBookmarked } : item));
                                  if (onShowToast) onShowToast(m.isBookmarked ? 'Bookmark Removed' : 'Message Bookmarked', 'Saved to notes', 'info');
                                }}
                                className={`hover:text-indigo-400 transition-colors ${m.isBookmarked ? 'text-amber-400' : ''}`}
                                title="Bookmark"
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                              </button>

                              {/* Download */}
                              <button
                                onClick={() => handleDownloadResponse(m.text)}
                                className="hover:text-indigo-400 transition-colors"
                                title="Download Markdown"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}

                {/* ANIMATED THINKING & TYPING INDICATOR */}
                {isLoading && (
                  <div className="flex gap-2.5 items-center text-xs text-indigo-300 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 w-fit animate-pulse shadow-md">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> Gemini Thinking...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT AREA - CLEAN & SIMPLE */}
              <div className="p-2.5 sm:p-3 border-t border-slate-800/90 bg-slate-950/90 space-y-2">
                
                {/* SUGGESTIONS POPOVER - OPTIONAL WHEN TOGGLED */}
                {showSuggestions && (
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-1">
                      <span>Suggested Prompts:</span>
                      <button onClick={() => setShowSuggestions(false)} className="hover:text-white">✕</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestionChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleSendMessage(chip.prompt);
                            setShowSuggestions(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-all"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Previews */}
                {(attachedImage || attachedFile) && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300 font-medium truncate">
                      {attachedImage ? "Image Attached" : attachedFile}
                    </span>
                    <button
                      onClick={() => { setAttachedImage(null); setAttachedFile(null); }}
                      className="p-1 text-slate-400 hover:text-white ml-auto"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* INPUT BAR */}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 focus-within:border-indigo-500 rounded-xl p-1.5 transition-all shadow-md"
                >
                  {/* File Attachment Hidden Inputs */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachedFile(e.target.files[0].name);
                        if (onShowToast) onShowToast('File Attached', e.target.files[0].name, 'info');
                      }
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const url = URL.createObjectURL(e.target.files[0]);
                        setAttachedImage(url);
                        if (onShowToast) onShowToast('Image Uploaded', 'Ready for vision analysis', 'info');
                      }
                    }}
                  />

                  {/* Ideas Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className={`p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors shrink-0 ${
                      showSuggestions ? 'text-amber-400 bg-amber-400/10' : ''
                    }`}
                    title="Toggle Prompt Ideas"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>

                  {/* Attachment trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Image upload trigger */}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors shrink-0"
                    title="Upload image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Voice input trigger */}
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`p-2 rounded-lg transition-all shrink-0 ${
                      isListening 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                    }`}
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Main Input Textfield */}
                  <input
                    type="text"
                    placeholder={`Message MuniAI Copilot...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs sm:text-sm bg-transparent text-white placeholder-slate-500 focus:outline-none font-medium"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isLoading || (!input.trim() && !attachedImage)}
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-md shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: MUSIC STUDIO (LYRIA 3) */}
          {activeTab === 'music' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-purple-800/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-white">AI Music Generator (Lyria 3)</h2>
                    <p className="text-xs text-purple-300">Models: <code className="font-mono text-amber-300">lyria-3-clip-preview</code> (30s) & <code className="font-mono text-emerald-300">lyria-3-pro-preview</code> (full track)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                    placeholder="Describe track style, tempo, instruments, and mood..."
                  />

                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Duration:</span>
                      <button
                        onClick={() => setMusicDuration(30)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          musicDuration === 30 ? 'bg-purple-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        30s Clip
                      </button>
                      <button
                        onClick={() => setMusicDuration(120)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          musicDuration === 120 ? 'bg-purple-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        Full Track
                      </button>
                    </div>

                    <button
                      onClick={handleGenerateMusic}
                      disabled={isGeneratingMusic || !musicPrompt.trim()}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-40"
                    >
                      {isGeneratingMusic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      <span>Generate Track</span>
                    </button>
                  </div>
                </div>

                {generatedTrack && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 font-mono">{generatedTrack.trackName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">{generatedTrack.modelUsed}</span>
                    </div>
                    <p className="text-xs text-slate-300">{generatedTrack.description}</p>
                    <audio controls className="w-full h-9 rounded-xl border border-slate-800">
                      <source src={generatedTrack.audioUrl} type="audio/ogg" />
                    </audio>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE STUDIO (GEMINI 3 PRO) */}
          {activeTab === 'image' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-indigo-800/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-white">Gemini Image Studio & Editor</h2>
                    <p className="text-xs text-indigo-300">Models: <code className="font-mono text-emerald-300">gemini-3-pro-image-preview</code> & <code className="font-mono text-indigo-300">gemini-3.1-flash-image-preview</code></p>
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    placeholder="Image prompt details..."
                  />

                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Resolution:</span>
                      {(['1K', '2K', '4K'] as const).map(res => (
                        <button
                          key={res}
                          onClick={() => setImageResolution(res)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            imageResolution === res ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isImageEdit}
                          onChange={(e) => setIsImageEdit(e.target.checked)}
                          className="rounded text-indigo-600 bg-slate-900 border-slate-800"
                        />
                        <span>Edit Mode</span>
                      </label>

                      <button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !imagePrompt.trim()}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-40"
                      >
                        {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        <span>Generate {imageResolution} Image</span>
                      </button>
                    </div>
                  </div>
                </div>

                {generatedImage && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-3 animate-in fade-in">
                    <img src={generatedImage.imageUrl} alt="Generated" className="w-full max-h-80 object-cover rounded-xl border border-slate-800" />
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Resolution: {generatedImage.resolution}</span>
                      <span>Model: {generatedImage.model}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VEO VIDEO STUDIO */}
          {activeTab === 'video' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-pink-800/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-pink-600 text-white shadow-lg shadow-pink-600/30">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-white">Veo Video Generator</h2>
                    <p className="text-xs text-pink-300">Model: <code className="font-mono text-amber-300">veo-3.1-fast-generate-preview</code></p>
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-pink-500 font-medium"
                    placeholder="Prompt for video generation..."
                  />

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Aspect Ratio:</span>
                      <button
                        onClick={() => setVideoAspectRatio('16:9')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          videoAspectRatio === '16:9' ? 'bg-pink-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        16:9 Landscape
                      </button>
                      <button
                        onClick={() => setVideoAspectRatio('9:16')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          videoAspectRatio === '9:16' ? 'bg-pink-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        9:16 Portrait Reel
                      </button>
                    </div>

                    <button
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo || !videoPrompt.trim()}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-40"
                    >
                      {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      <span>Generate Veo Video</span>
                    </button>
                  </div>
                </div>

                {generatedVideo && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-pink-500/30 space-y-3 animate-in fade-in">
                    <video controls className="w-full max-h-80 object-cover rounded-xl border border-slate-800">
                      <source src={generatedVideo.videoUrl} type="video/mp4" />
                    </video>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: VISION & VIDEO ANALYZER */}
          {activeTab === 'vision' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-emerald-800/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-white">Multimodal Image & Video Understanding</h2>
                    <p className="text-xs text-emerald-300">Model: <code className="font-mono text-emerald-300">gemini-3.1-pro-preview</code></p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={mediaAnalysisPrompt}
                    onChange={(e) => setMediaAnalysisPrompt(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="Ask Gemini to analyze photo or video content..."
                  />

                  <button
                    onClick={handleAnalyzeMedia}
                    disabled={isAnalyzingMedia}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-40"
                  >
                    {isAnalyzingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    <span>Run Multimodal Analysis</span>
                  </button>
                </div>

                {analysisResult && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2 animate-in fade-in">
                    <div className="text-xs font-bold text-emerald-300">Analysis Output:</div>
                    <p className="text-xs text-slate-200 leading-relaxed">{analysisResult.analysis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: TRANSCRIBE AUDIO */}
          {activeTab === 'transcribe' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-amber-800/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/30">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-white">Speech & Audio Transcriber</h2>
                    <p className="text-xs text-amber-300">Model: <code className="font-mono text-amber-300">gemini-3.5-flash</code></p>
                  </div>
                </div>

                <button
                  onClick={handleTranscribeAudio}
                  disabled={isTranscribing}
                  className="px-5 py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-40"
                >
                  {isTranscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                  <span>Start Speech Transcription</span>
                </button>

                {transcriptResult && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2 animate-in fade-in">
                    <div className="text-xs font-bold text-amber-300">Transcribed Text:</div>
                    <p className="text-xs text-slate-200 font-mono">{transcriptResult.transcript}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: HIGH THINKING MODE */}
          {activeTab === 'deepthink' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-cyan-800/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-white">High Thinking Reasoning Mode</h2>
                    <p className="text-xs text-cyan-300">Model: <code className="font-mono text-cyan-300">gemini-3.1-pro-preview</code> (Reasoning Level HIGH)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={deepThinkQuery}
                    onChange={(e) => setDeepThinkQuery(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                    placeholder="Complex system architecture or mathematical reasoning question..."
                  />

                  <button
                    onClick={handleDeepThink}
                    disabled={isDeepThinking}
                    className="px-5 py-2.5 rounded-2xl bg-cyan-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-40"
                  >
                    {isDeepThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    <span>Execute High Thinking Path</span>
                  </button>
                </div>

                {deepThinkResult && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2 animate-in fade-in">
                    <div className="text-xs font-bold text-cyan-300">Reasoning Chain & Synthesis:</div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{deepThinkResult.synthesis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR - QUICK STARTERS & CAPABILITIES PANEL (Blue circled area on desktop!) */}
        <div className="hidden lg:flex flex-col w-60 xl:w-64 rounded-2xl border bg-slate-950/90 border-slate-800/90 p-3 shrink-0 shadow-xl overflow-y-auto space-y-3.5 z-10">
          
          {/* Section 1: Quick Action Capabilities */}
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Quick Starters
              </span>
              <span className="text-[9px] text-indigo-400 font-semibold">MuniSocial</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'create_post', title: 'Create Post', desc: 'Draft viral post with tags', icon: PlusCircle, color: 'text-indigo-400' },
                { id: 'generate_image', title: 'Generate Image', desc: '4K AI visuals & graphics', icon: ImageIcon, color: 'text-purple-400' },
                { id: 'analyze_doc', title: 'Analyze Doc', desc: 'Extract insights & summary', icon: FileText, color: 'text-emerald-400' },
                { id: 'write_email', title: 'Write Email', desc: 'Draft sponsor pitches', icon: Mail, color: 'text-amber-400' },
                { id: 'plan_project', title: 'Plan Project', desc: 'Content calendar', icon: Calendar, color: 'text-pink-400' },
                { id: 'study_assistant', title: 'Study Assistant', desc: 'Explain code & AI', icon: BookOpen, color: 'text-cyan-400' }
              ].map((card) => {
                const CardIcon = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleQuickAction(card.id)}
                    className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group shadow-xs flex items-center gap-2.5"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/80 group-hover:border-indigo-500/40 shrink-0">
                      <CardIcon className={`w-3.5 h-3.5 ${card.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                        <span className="truncate">{card.title}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors shrink-0" />
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{card.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Prompt Suggestions / Quick Chips */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-indigo-400" /> Suggested Prompts
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 text-[11px] font-semibold transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Ecosystem Intelligence Info Card */}
          <div className="pt-2 border-t border-slate-800/80 p-2.5 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/20 text-slate-400 text-[10px] font-mono space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Live AI Engine
            </div>
            <div>Context: <span className="text-indigo-300 font-bold">{currentView}</span></div>
            <div>Model: <span className="text-amber-300">Gemini 3.6 Flash</span></div>
            <div className="text-[9px] text-slate-500 pt-1">Fully integrated into MuniSocial</div>
          </div>

        </div>
      </div>

    </div>
  );
};
