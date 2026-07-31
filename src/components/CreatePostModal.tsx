import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Code, 
  BarChart2, 
  FileText, 
  ListPlus, 
  ShoppingBag, 
  Wand2, 
  Send,
  Loader2,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { SocialPost, ContentType, UserProfile, Story } from '../types';
import { uploadMediaFile, uploadVideoFile, createDatabasePost, createDatabaseStory } from '../lib/dbService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (post: SocialPost) => void;
  onAddStory?: (story: Story) => void;
  user: UserProfile;
  isDarkMode: boolean;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onAddPost,
  onAddStory,
  user,
  isDarkMode,
}) => {
  const [selectedType, setSelectedType] = useState<ContentType>('text');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [tags, setTags] = useState('MuniSocial, Tech, AI');
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // Custom type states
  const [pollQuestion, setPollQuestion] = useState('What technology will dominate 2026?');
  const [pollOptions, setPollOptions] = useState(['Agentic AI Frameworks', 'Quantum Web', 'Space Internet', 'VR/AR Displays']);
  const [codeLang, setCodeLang] = useState('typescript');
  const [codeSnippet, setCodeSnippet] = useState('const muniAi = new GoogleGenAI({ apiKey });');
  const [threadItems, setThreadItems] = useState(['1/3: Next-gen social architectures require zero latency.', '2/3: Server-side Gemini API calls protect keys safely.', '3/3: Join MuniSocial today!']);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const isVideo = file.type.startsWith('video/') || selectedType === 'short_video' || selectedType === 'long_video';
      if (isVideo) {
        const { url, post } = await uploadVideoFile(file, content || file.name, 'Shorts');
        setMediaUrl(url);
        setUploadedFileName(`🎥 ${file.name}`);
        if (selectedType !== 'short_video' && selectedType !== 'long_video') {
          setSelectedType('short_video');
        }
      } else {
        const url = await uploadMediaFile(file);
        setMediaUrl(url);
        setUploadedFileName(file.name);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAiAutoDraft = async () => {
    setIsAiDrafting(true);
    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          topic: content || 'The launch of MuniSocial next-generation AI social network',
          tone: 'viral and inspiring'
        })
      });
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
      }
    } catch (err) {
      console.error(err);
      setContent("🚀 Excited to share our latest breakthrough on MuniSocial! Built with Gemini 3.6 Flash, real-time streaming, and enterprise security by Municryptrix. #MuniSocial #FutureOfSocial");
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((selectedType as string) === 'story' && onAddStory) {
      const newStory: Story = {
        id: `st_${Date.now()}`,
        author: {
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        },
        mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        type: 'image',
        caption: content || '24h Ephemeral Story on MuniSocial',
        hasUnseen: true,
        createdAt: new Date().toISOString(),
      };
      await createDatabaseStory(newStory);
      onAddStory(newStory);
      onClose();
      return;
    }

    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      author: user,
      type: selectedType,
      content: content || 'Drafted on MuniSocial',
      mediaUrls: mediaUrl ? [mediaUrl] : (selectedType === 'short_video' ? ['https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80'] : []),
      likesCount: 1,
      repostsCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      createdAt: new Date().toISOString(),
      tags: (tags || '').split(',').map(t => t.trim()).filter(Boolean),
      isLiked: true,
      aiScore: 98,
      aiTopic: 'User Created',
      ...(selectedType === 'poll' ? {
        pollDetails: {
          question: pollQuestion,
          options: pollOptions.map(o => ({ text: o, votes: 0 })),
          totalVotes: 0,
        }
      } : {}),
      ...(selectedType === 'code' ? {
        codeDetails: {
          language: codeLang,
          code: codeSnippet
        }
      } : {}),
      ...(selectedType === 'thread' ? {
        threadSequence: threadItems
      } : {}),
      ...(selectedType === 'short_video' ? {
        videoDetails: {
          duration: '0:30',
          aspectRatio: '9:16',
          views: 1,
          quality: '1080p',
          audioTrack: 'Original Sound - ' + (user?.name || 'Creator')
        }
      } : {}),
      ...(selectedType === 'long_video' ? {
        videoDetails: {
          duration: '10:00',
          aspectRatio: '16:9',
          views: 1,
          quality: '4K',
          audioTrack: 'Studio HQ Audio'
        }
      } : {})
    };

    await createDatabasePost(newPost);
    onAddPost(newPost);
    onClose();
  };

  const contentTypes: { id: ContentType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'story' as any, label: '24h Story', icon: Sparkles },
    { id: 'text', label: 'Post', icon: FileText },
    { id: 'image', label: 'Photo/Carousel', icon: ImageIcon },
    { id: 'short_video', label: 'Reel/Short', icon: Video },
    { id: 'long_video', label: '4K Video', icon: Video },
    { id: 'thread', label: 'Thread', icon: ListPlus },
    { id: 'poll', label: 'Poll', icon: BarChart2 },
    { id: 'code', label: 'Code Block', icon: Code },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base">Create on MuniSocial</h2>
              <p className="text-[11px] text-slate-400">Share posts, 4K videos, reels, threads, or polls</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Selector */}
        <div className="p-3 border-b border-slate-800/60 bg-slate-950/40 overflow-x-auto no-scrollbar flex items-center gap-2">
          {contentTypes.map((ct) => {
            const Icon = ct.icon;
            const isSelected = selectedType === ct.id;
            return (
              <button
                key={ct.id}
                onClick={() => setSelectedType(ct.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400' 
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-indigo-300" />
                <span>{ct.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* User Info & AI Draft Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
              <div>
                <h4 className="font-bold text-xs">{user.name}</h4>
                <span className="text-[10px] text-indigo-400 font-mono">Publishing to Global Feed</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAiAutoDraft}
              disabled={isAiDrafting}
              className="px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              {isAiDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <Wand2 className="w-3.5 h-3.5 text-indigo-400" />}
              <span>Draft with MuniAI</span>
            </button>
          </div>

          {/* Content Textarea */}
          <div>
            <textarea
              rows={4}
              placeholder={
                selectedType === 'short_video' ? 'Write caption for your TikTok-style reel...' :
                selectedType === 'long_video' ? 'Write description and chapter details for your 4K video...' :
                selectedType === 'code' ? 'Add explanation for this code block...' :
                'What is on your mind? Share thoughts, news, or ideas...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Conditional Media URL or File Upload */}
          {(selectedType === 'image' || selectedType === 'short_video' || selectedType === 'long_video' || selectedType === 'marketplace' || (selectedType as string) === 'story') && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Upload Media or Provide URL:
              </label>

              {/* Drag and Drop / File Input Box */}
              <div 
                className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-4 bg-slate-950/40 text-center transition-all cursor-pointer relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
              >
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />

                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-indigo-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-semibold">Uploading file to server...</span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Uploaded: {uploadedFileName}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-1 text-slate-400">
                    <Upload className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-medium text-slate-300">
                      Drag & drop image/video here, or <span className="text-indigo-400 underline">browse file</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Supports PNG, JPG, MP4, WEBM</span>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Or paste image/video URL: https://..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Code Block Options */}
          {selectedType === 'code' && (
            <div className="space-y-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-indigo-400">Language:</label>
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="sql">PostgreSQL SQL</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <textarea
                rows={4}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 border border-slate-800 focus:outline-none"
              />
            </div>
          )}

          {/* Poll Options */}
          {selectedType === 'poll' && (
            <div className="space-y-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <input
                type="text"
                placeholder="Poll question..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white mb-2"
              />
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[idx] = e.target.value;
                    setPollOptions(next);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
                />
              ))}
            </div>
          )}

          {/* Hashtags Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Hashtags (comma separated):</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Grounded by MuniAI Index</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
