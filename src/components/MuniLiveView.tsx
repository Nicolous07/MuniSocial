import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Flame, 
  Swords, 
  Music, 
  Gamepad2, 
  MessageCircle, 
  Globe, 
  Star, 
  Heart, 
  Send, 
  Gift, 
  Zap, 
  Eye, 
  Video, 
  X, 
  Plus, 
  UserCheck, 
  UserPlus, 
  Trophy, 
  Sparkles, 
  Share2, 
  SlidersHorizontal, 
  Coins, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Crown, 
  Sparkle,
  Camera,
  Wand2,
  Lock,
  DollarSign,
  TrendingUp,
  Award,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  PhoneOff,
  RefreshCw,
  Users,
  MessageSquare,
  PlayCircle,
  PauseCircle,
  Square,
  Smile,
  Volume1
} from 'lucide-react';
import { UserProfile } from '../types';
import { triggerHaptic } from '../lib/haptics';

interface LiveStreamHost {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  title: string;
  category: 'popular' | 'pk' | 'music' | 'gaming' | 'chat' | 'global';
  viewersCount: number;
  diamondsEarned: number;
  giftGoalTitle: string;
  giftGoalCurrent: number;
  giftGoalTarget: number;
  isPkBattle?: boolean;
  pkOpponent?: {
    name: string;
    username: string;
    avatar: string;
    diamonds: number;
  };
  pkTimerSeconds?: number;
  level: number;
  verified: boolean;
  isFollowing?: boolean;
}

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  coins: number;
  category: 'popular' | 'luxury' | 'special' | 'vip';
  animation: string;
}

interface LiveChatMessage {
  id: string;
  username: string;
  userAvatar: string;
  text: string;
  userLevel: number;
  isVip?: boolean;
  giftSent?: {
    giftName: string;
    icon: string;
    coins: number;
  };
  timestamp: string;
}

interface MuniLiveViewProps {
  user: UserProfile;
  isDarkMode: boolean;
  showToast?: (title: string, message?: string, type?: 'success' | 'info' | 'alert' | 'error') => void;
}

const GIFTS_CATALOG: GiftItem[] = [
  { id: 'g1', name: 'Rose', icon: '🌹', coins: 5, category: 'popular', animation: 'floating-roses' },
  { id: 'g2', name: 'Sparkle Heart', icon: '💖', coins: 10, category: 'popular', animation: 'heart-pop' },
  { id: 'g3', name: 'Ice Cream', icon: '🍦', coins: 25, category: 'popular', animation: 'ice-cream-bounce' },
  { id: 'g4', name: 'Champagne', icon: '🍾', coins: 100, category: 'luxury', animation: 'champagne-pop' },
  { id: 'g5', name: 'Sports Car', icon: '🏎️', coins: 500, category: 'luxury', animation: 'car-drive' },
  { id: 'g6', name: 'Golden Crown', icon: '👑', coins: 1000, category: 'special', animation: 'crown-glow' },
  { id: 'g7', name: 'Space Rocket', icon: '🚀', coins: 5000, category: 'special', animation: 'rocket-launch' },
  { id: 'g8', name: 'Fire Dragon', icon: '🐉', coins: 10000, category: 'vip', animation: 'dragon-fly' },
  { id: 'g9', name: 'Magic Castle', icon: '🏰', coins: 25000, category: 'vip', animation: 'castle-shimmer' },
];

const INITIAL_HOSTS: LiveStreamHost[] = [
  {
    id: 'stream_1',
    name: 'Elena Vibes',
    username: 'elena_music',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    title: '🎵 Late Night Acoustic Vibes & Freestyle Sessions | Tango Live #1',
    category: 'music',
    viewersCount: 18420,
    diamondsEarned: 142500,
    giftGoalTitle: '🏰 Magic Castle Goal',
    giftGoalCurrent: 18400,
    giftGoalTarget: 25000,
    isPkBattle: true,
    pkOpponent: {
      name: 'DJ Marco',
      username: 'dj_marco_official',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      diamonds: 16800
    },
    pkTimerSeconds: 165,
    level: 64,
    verified: true,
    isFollowing: false
  },
  {
    id: 'stream_2',
    name: 'CyberGamer X',
    username: 'cybergamer_x',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',
    title: '⚔️ EPIC PK BATTLE! 100k Diamonds Target - Support Cyber Clan!',
    category: 'pk',
    viewersCount: 29500,
    diamondsEarned: 310800,
    giftGoalTitle: '🐉 Fire Dragon Goal',
    giftGoalCurrent: 82000,
    giftGoalTarget: 100000,
    isPkBattle: true,
    pkOpponent: {
      name: 'Ninja Queen',
      username: 'ninja_queen_live',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      diamonds: 94500
    },
    pkTimerSeconds: 88,
    level: 72,
    verified: true,
    isFollowing: true
  },
  {
    id: 'stream_3',
    name: 'Sophia Dance',
    username: 'sophia_dance_studio',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
    title: '💃 Latino Street Dance & Q&A Chat | Send Roses to Request Songs',
    category: 'popular',
    viewersCount: 12100,
    diamondsEarned: 89000,
    giftGoalTitle: '🚀 Rocket Goal',
    giftGoalCurrent: 4100,
    giftGoalTarget: 5000,
    level: 48,
    verified: true,
    isFollowing: false
  },
  {
    id: 'stream_4',
    name: 'Aria Tech & AI',
    username: 'aria_ai_live',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
    title: '🤖 Building AI Apps Live! Code Debugging & Tech Q&A Room',
    category: 'chat',
    viewersCount: 8400,
    diamondsEarned: 54200,
    giftGoalTitle: '🏎️ Sports Car Goal',
    giftGoalCurrent: 380,
    giftGoalTarget: 500,
    level: 39,
    verified: false,
    isFollowing: true
  },
  {
    id: 'stream_5',
    name: 'Tokyo DJ Live',
    username: 'tokyo_beats_88',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    title: '🎧 Cyberpunk Synthwave Live DJ Set from Shibuya Studio',
    category: 'global',
    viewersCount: 15800,
    diamondsEarned: 198000,
    giftGoalTitle: '👑 Crown Goal',
    giftGoalCurrent: 890,
    giftGoalTarget: 1000,
    level: 55,
    verified: true,
    isFollowing: false
  }
];

export const MuniLiveView: React.FC<MuniLiveViewProps> = ({
  user,
  isDarkMode,
  showToast
}) => {
  // Main Sub-Tab Mode: 'streams' | 'match1v1' | 'groupParty' | 'directChat'
  const [activeMainTab, setActiveMainTab] = useState<'streams' | 'match1v1' | 'groupParty' | 'directChat'>('streams');

  // Navigation & Category state
  const [activeCategory, setActiveCategory] = useState<'popular' | 'pk' | 'music' | 'gaming' | 'chat' | 'global'>('popular');
  const [hostsList, setHostsList] = useState<LiveStreamHost[]>(INITIAL_HOSTS);
  const [activeHost, setActiveHost] = useState<LiveStreamHost>(INITIAL_HOSTS[0]);

  // User Wallet Coins Balance (Tango style)
  const [userCoins, setUserCoins] = useState<number>(4250);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);

  // Active Stream State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([
    { id: 'm1', username: 'Lucas_Vip', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', text: 'Elena your voice is magical tonight! 🔥😍', userLevel: 42, isVip: true, timestamp: '22:01' },
    { id: 'm2', username: 'Sarah_99', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', text: 'Sent 5 Roses! 🌹🌹🌹🌹🌹', userLevel: 18, giftSent: { giftName: 'Rose', icon: '🌹', coins: 5 }, timestamp: '22:02' },
    { id: 'm3', username: 'CryptoKing', userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80', text: 'WE ARE WINNING THE PK BATTLE!! KEEP GIFTING! ⚔️', userLevel: 55, isVip: true, timestamp: '22:02' },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Floating Hearts / Reaction Animation
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number; emoji: string }[]>([]);

  // Modals & Drawers
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState<boolean>(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem>(GIFTS_CATALOG[0]);
  const [isGoLiveModalOpen, setIsGoLiveModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Active Gift Banner Effect on stream
  const [activeGiftBanner, setActiveGiftBanner] = useState<{ sender: string; gift: GiftItem } | null>(null);

  // Category Bar Ref
  const categoriesRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Go Live Broadcast Studio Form
  const [streamTitle, setStreamTitle] = useState<string>('✨ Late Night Vibe Lounge & Interactive Chat');
  const [streamCategory, setStreamCategory] = useState<'music' | 'chat' | 'gaming' | 'pk'>('chat');
  const [selectedFilter, setSelectedFilter] = useState<string>('Smooth Beauty');
  const [targetGiftGoal, setTargetGiftGoal] = useState<number>(5000);
  const [isLiveBroadcasting, setIsLiveBroadcasting] = useState<boolean>(false);

  // --- 1V1 VIDEO MATCH ("ANA KWA ANA") STATE ---
  const MATCH_POOL = [
    { id: 'm1', name: 'Amina Swahili', username: 'amina_vibes', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', location: 'Mwanza, Tanzania 🇹🇿', age: 23, bio: 'Singer & Swahili Storyteller 🎵' },
    { id: 'm2', name: 'David Nairobi', username: 'david_kenya', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', location: 'Nairobi, Kenya 🇰🇪', age: 26, bio: 'Tech lover & Afrobeat DJ 🎧' },
    { id: 'm3', name: 'Zainab Dar', username: 'zainab_live', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', location: 'Dar es Salaam, Tanzania 🇹🇿', age: 22, bio: 'Fashion addict & Live talk host 💃' },
    { id: 'm4', name: 'Kev Kigali', username: 'kev_rwanda', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', location: 'Kigali, Rwanda 🇷🇼', age: 25, bio: 'Gamer & Acoustic guitarist 🎸' },
  ];
  const [matchPartnerIndex, setMatchPartnerIndex] = useState<number>(0);
  const [is1v1Matching, setIs1v1Matching] = useState<boolean>(false);
  const [is1v1Muted, setIs1v1Muted] = useState<boolean>(false);
  const [is1v1CamOff, setIs1v1CamOff] = useState<boolean>(false);
  const [filter1v1, setFilter1v1] = useState<string>('Smooth Beauty');

  // --- GROUP VIDEO PARTY ("KUKUTANA KAMA GROUP") STATE ---
  const [partySeats, setPartySeats] = useState<Array<{
    seatId: number;
    user: { name: string; avatar: string; username: string } | null;
    isHost?: boolean;
    isMuted: boolean;
    isSpeaking: boolean;
    hasVideo: boolean;
  }>>([
    { seatId: 1, user: { name: 'Elena Host 👑', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', username: 'elena_host' }, isHost: true, isMuted: false, isSpeaking: true, hasVideo: true },
    { seatId: 2, user: { name: 'Marco DJ 🎧', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', username: 'marco_dj' }, isMuted: false, isSpeaking: false, hasVideo: true },
    { seatId: 3, user: { name: 'Sophia 💃', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', username: 'sophia_d' }, isMuted: true, isSpeaking: false, hasVideo: true },
    { seatId: 4, user: null, isMuted: false, isSpeaking: false, hasVideo: false },
    { seatId: 5, user: null, isMuted: false, isSpeaking: false, hasVideo: false },
    { seatId: 6, user: null, isMuted: false, isSpeaking: false, hasVideo: false },
  ]);
  const [userPartySeatId, setUserPartySeatId] = useState<number | null>(null);
  const [groupMessages, setGroupMessages] = useState<Array<{ id: string; sender: string; text: string; time: string }>>([
    { id: 'g1', sender: 'Marco DJ', text: 'Welcome to the Party Room everyone! 🎵🔥', time: '22:10' },
    { id: 'g2', sender: 'Sophia', text: 'Seat #4 is open! Who wants to turn on cam? 📹', time: '22:11' },
  ]);
  const [groupInput, setGroupInput] = useState<string>('');

  // --- DIRECT VOICE & TEXT CHAT ("CHAT YA MAANDISHI NA SAUTI") STATE ---
  const DIRECT_CONTACTS = [
    { id: 'c1', name: 'Elena Vibes', username: 'elena_music', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', online: true },
    { id: 'c2', name: 'DJ Marco', username: 'dj_marco', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', online: true },
    { id: 'c3', name: 'Sophia Dance', username: 'sophia_d', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', online: false },
  ];
  const [selectedDirectUser, setSelectedDirectUser] = useState(DIRECT_CONTACTS[0]);
  const [directMessages, setDirectMessages] = useState<Array<{
    id: string;
    senderId: string;
    text?: string;
    voiceNote?: { durationSec: number; waveform: number[] };
    timestamp: string;
  }>>([
    { id: 'dm1', senderId: 'c1', text: 'Habari! Thanks for watching my stream earlier! 🔥', timestamp: '21:40' },
    { id: 'dm2', senderId: 'c1', voiceNote: { durationSec: 8, waveform: [30, 60, 90, 40, 80, 100, 50, 70, 30] }, timestamp: '21:42' },
    { id: 'dm3', senderId: 'me', text: 'Asante sana! Sent you 5 Roses 🌹', timestamp: '21:45' }
  ]);
  const [directTextInput, setDirectTextInput] = useState<string>('');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceRecordSec, setVoiceRecordSec] = useState<number>(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Timer for Voice Note Recording simulation
  useEffect(() => {
    let interval: any = null;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceRecordSec(prev => prev + 1);
      }, 1000);
    } else {
      setVoiceRecordSec(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Simulated live viewers increment & live comments ticker
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly tweak active host viewer count
      setActiveHost(prev => ({
        ...prev,
        viewersCount: Math.max(100, prev.viewersCount + Math.floor(Math.random() * 9) - 4)
      }));

      // Random incoming community live chat comment
      const sampleNames = ['Kev_25', 'Maya_Beats', 'Alex_007', 'Zoe_Vibes', 'Liam_Pro', 'Nina_Art'];
      const sampleTexts = [
        'Awesome stream! 🔥',
        'Who else is watching from Tokyo? 🇯🇵',
        'Sent a gift! Keep it up! 👑',
        'Play the next song please! 🎵',
        'PK score is so close right now! ⚔️'
      ];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

      const newMsg: LiveChatMessage = {
        id: `msg_${Date.now()}`,
        username: randomName,
        userAvatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&w=100&q=80`,
        text: randomText,
        userLevel: Math.floor(Math.random() * 50) + 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev.slice(-25), newMsg]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Handle Heart Reaction Click (Floating up the stream screen)
  const triggerHeartAnimation = (emoji = '❤️') => {
    triggerHaptic('light');
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.floor(Math.random() * 70) + 15,
      emoji
    };
    setFloatingHearts(prev => [...prev.slice(-15), newHeart]);

    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2500);
  };

  // Handle Send Chat Comment
  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    triggerHaptic('light');
    const newMsg: LiveChatMessage = {
      id: `usr_msg_${Date.now()}`,
      username: user.username || user.name,
      userAvatar: user.avatar,
      text: chatInput.trim(),
      userLevel: 25,
      isVip: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  // Handle Send Gift to Host (Tango Gifting)
  const handleSendGift = () => {
    if (userCoins < selectedGift.coins) {
      triggerHaptic('heavy');
      if (showToast) {
        showToast('Insufficient Coins', 'Recharge your Tango Coins balance to send this gift!', 'alert');
      } else {
        alert('Insufficient Coins! Please recharge your coin balance.');
      }
      setIsRechargeModalOpen(true);
      return;
    }

    triggerHaptic('success');
    // Deduct coins
    setUserCoins(prev => prev - selectedGift.coins);

    // Update streamer diamonds goal
    setActiveHost(prev => ({
      ...prev,
      diamondsEarned: prev.diamondsEarned + selectedGift.coins,
      giftGoalCurrent: Math.min(prev.giftGoalTarget, prev.giftGoalCurrent + selectedGift.coins),
      pkOpponent: prev.pkOpponent ? {
        ...prev.pkOpponent,
        diamonds: prev.pkOpponent.diamonds + selectedGift.coins
      } : undefined
    }));

    // Trigger visual gift banner on video feed
    setActiveGiftBanner({
      sender: user.name,
      gift: selectedGift
    });
    setTimeout(() => setActiveGiftBanner(null), 3500);

    // Add highlighted message to live chat
    const giftMsg: LiveChatMessage = {
      id: `gift_msg_${Date.now()}`,
      username: user.name,
      userAvatar: user.avatar,
      text: `sent ${selectedGift.name} ${selectedGift.icon} (+${selectedGift.coins} 💎)!`,
      userLevel: 30,
      isVip: true,
      giftSent: {
        giftName: selectedGift.name,
        icon: selectedGift.icon,
        coins: selectedGift.coins
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, giftMsg]);

    // Send hearts explosion
    for (let i = 0; i < 4; i++) {
      setTimeout(() => triggerHeartAnimation(selectedGift.icon), i * 200);
    }

    if (showToast) {
      showToast(`Sent ${selectedGift.name}!`, `Sent ${selectedGift.icon} to @${activeHost.username}`, 'success');
    }

    setIsGiftDrawerOpen(false);
  };

  // Toggle Host Follow State
  const handleToggleFollow = (hostId: string) => {
    triggerHaptic('light');
    setHostsList(prev => prev.map(h => {
      if (h.id === hostId) {
        const next = !h.isFollowing;
        if (showToast) {
          showToast(next ? 'Following Host' : 'Unfollowed Host', `@${h.username}`, 'info');
        }
        return { ...h, isFollowing: next };
      }
      return h;
    }));

    if (activeHost.id === hostId) {
      setActiveHost(prev => ({ ...prev, isFollowing: !prev.isFollowing }));
    }
  };

  // Handle Start User Broadcast (Go Live)
  const handleStartBroadcast = () => {
    triggerHaptic('success');
    setIsGoLiveModalOpen(false);
    setIsLiveBroadcasting(true);

    const userHost: LiveStreamHost = {
      id: `my_stream_${Date.now()}`,
      name: user.name,
      username: user.username || 'my_channel',
      avatar: user.avatar,
      coverImage: user.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      title: streamTitle,
      category: streamCategory === 'pk' ? 'pk' : 'popular',
      viewersCount: 1,
      diamondsEarned: 0,
      giftGoalTitle: '🚀 First Live Goal',
      giftGoalCurrent: 0,
      giftGoalTarget: targetGiftGoal,
      level: 25,
      verified: true,
      isFollowing: true
    };

    setActiveHost(userHost);
    setHostsList(prev => [userHost, ...prev]);

    if (showToast) {
      showToast('You are Live! 🔴', 'Your stream is now live across the MuniSocial ecosystem.', 'success');
    }
  };

  // 1v1 Video Match Handler
  const handleNext1v1Match = () => {
    triggerHaptic('light');
    setIs1v1Matching(true);
    setTimeout(() => {
      setMatchPartnerIndex(prev => (prev + 1) % MATCH_POOL.length);
      setIs1v1Matching(false);
      triggerHaptic('success');
      if (showToast) showToast('New 1v1 Match Connected! 🤝', 'Say hello to your new video partner!', 'info');
    }, 1200);
  };

  // Group Party Seat Handler
  const handleTogglePartySeat = (seatId: number) => {
    triggerHaptic('light');
    if (userPartySeatId === seatId) {
      // Leave seat
      setPartySeats(prev => prev.map(s => s.seatId === seatId ? { ...s, user: null, isSpeaking: false } : s));
      setUserPartySeatId(null);
      if (showToast) showToast('Left Seat', 'You left seat #' + seatId, 'info');
    } else {
      // Leave previous seat if any
      setPartySeats(prev => prev.map(s => {
        if (s.seatId === userPartySeatId) return { ...s, user: null, isSpeaking: false };
        if (s.seatId === seatId) return { ...s, user: { name: user.name, avatar: user.avatar, username: user.username || 'me' }, isSpeaking: true, hasVideo: true };
        return s;
      }));
      setUserPartySeatId(seatId);
      if (showToast) showToast('Joined Group Seat! 🪑', 'You are now live in seat #' + seatId, 'success');
    }
  };

  const handleSendGroupMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!groupInput.trim()) return;
    triggerHaptic('light');
    setGroupMessages(prev => [
      ...prev,
      { id: `g_msg_${Date.now()}`, sender: user.name, text: groupInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setGroupInput('');
  };

  // Direct Voice & Text Chat Handlers
  const handleSendDirectText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!directTextInput.trim()) return;
    triggerHaptic('light');
    setDirectMessages(prev => [
      ...prev,
      { id: `dm_${Date.now()}`, senderId: 'me', text: directTextInput.trim(), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setDirectTextInput('');
  };

  const handleSendVoiceNote = () => {
    triggerHaptic('success');
    setIsRecordingVoice(false);
    const duration = Math.max(2, voiceRecordSec);
    const randomWaveform = Array.from({ length: 9 }, () => Math.floor(Math.random() * 70) + 30);
    setDirectMessages(prev => [
      ...prev,
      { id: `dm_voice_${Date.now()}`, senderId: 'me', voiceNote: { durationSec: duration, waveform: randomWaveform }, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    if (showToast) showToast('Voice Note Sent! 🎙️', `Recorded ${duration}s audio`, 'success');
  };

  // Filtered Hosts list based on Category tab
  const filteredHosts = hostsList.filter(h => {
    if (activeCategory === 'popular') return true;
    if (activeCategory === 'pk') return h.isPkBattle;
    return h.category === activeCategory;
  });

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* ECOSYSTEM HEADER BAR */}
      <div className={`p-4 sm:p-6 rounded-3xl border transition-all ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-md text-slate-900'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    MuniLive 🔴
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-mono font-bold border border-pink-500/30 animate-pulse">
                    Tango.me Live Ecosystem
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Interactive Live Video, Gifting, PK Battle duels & Real-time Community Streamers
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT CONTROLS: COINS BALANCE & GO LIVE BUTTON */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Wallet Coins Badge */}
            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-600/20 border border-amber-500/40 text-amber-300 hover:border-amber-400 transition-all flex items-center gap-2 shadow-sm"
              title="Click to Recharge Tango Coins"
            >
              <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
              <div className="text-left">
                <p className="text-[9px] uppercase font-mono font-bold text-amber-400/80 leading-none">Coins Balance</p>
                <p className="text-xs font-black font-mono text-amber-300">{userCoins.toLocaleString()} 🪙</p>
              </div>
              <Plus className="w-3.5 h-3.5 text-amber-400 ml-1" />
            </button>

            {/* Leaderboard Trigger */}
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all shadow-sm"
              title="Top Streamers Leaderboard"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Go Live Button */}
            <button
              onClick={() => setIsGoLiveModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Video className="w-4 h-4 animate-pulse" />
              <span>🚀 Go Live</span>
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER BAR */}
      <div className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => {
            if (categoriesRef.current) categoriesRef.current.scrollBy({ left: -180, behavior: 'smooth' });
          }}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors shrink-0"
          title="Scroll Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div 
          ref={categoriesRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
        >
          {[
            { id: 'popular', label: '🔥 Popular & Hot', icon: Flame },
            { id: 'pk', label: '⚔️ PK Battles', icon: Swords },
            { id: 'music', label: '🎵 Music & Beats', icon: Music },
            { id: 'gaming', label: '🎮 Gaming Live', icon: Gamepad2 },
            { id: 'chat', label: '💬 Chat & Chill', icon: MessageCircle },
            { id: 'global', label: '🌍 Global Hosts', icon: Globe },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveCategory(cat.id as any);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30 scale-105'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            if (categoriesRef.current) categoriesRef.current.scrollBy({ left: 180, behavior: 'smooth' });
          }}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors shrink-0"
          title="Scroll Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ACTIVE FEATURED LIVE STREAM PLAYER (TANGO STYLE INTERACTIVE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN VIDEO STREAM FEED CONTAINER */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group min-h-[440px] sm:min-h-[520px] flex flex-col justify-between p-4 sm:p-6">
            
            {/* VIDEO BACKGROUND COVER / SIMULATED STREAM */}
            <div className="absolute inset-0 overflow-hidden z-0">
              <img 
                src={activeHost.coverImage} 
                alt={activeHost.title} 
                className={`w-full h-full object-cover transition-transform duration-1000 ${
                  isPlaying ? 'scale-105 filter brightness-90 contrast-105' : 'scale-100 filter brightness-50 blur-sm'
                }`} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />

              {/* DUAL LIVE PK BATTLE SPLIT SCREEN OVERLAY IF PK MODE */}
              {activeHost.isPkBattle && activeHost.pkOpponent && (
                <div className="absolute inset-0 grid grid-cols-2 pointer-events-none opacity-20">
                  <div className="border-r-2 border-red-500/80 bg-red-500/10" />
                  <div className="bg-blue-500/10" />
                </div>
              )}
            </div>

            {/* TOP OVERLAY: HOST INFO, VIEWERS COUNT & LIVE BADGE */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={activeHost.avatar} alt={activeHost.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500" />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-pink-600 text-[9px] font-mono font-bold text-white">
                    Lv.{activeHost.level}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">{activeHost.name}</h3>
                    {activeHost.verified && <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                      💎 {(activeHost.diamondsEarned / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">@{activeHost.username}</p>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => handleToggleFollow(activeHost.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ml-2 ${
                    activeHost.isFollowing 
                      ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                      : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30'
                  }`}
                >
                  {activeHost.isFollowing ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{activeHost.isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              </div>

              {/* Viewers & Live Indicator */}
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-xl bg-pink-600/90 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-pink-600/40">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>LIVE</span>
                </div>

                <div className="px-2.5 py-1 rounded-xl bg-black/60 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 border border-white/10">
                  <Eye className="w-3.5 h-3.5 text-pink-400" />
                  <span>{activeHost.viewersCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* PK BATTLE SCORE & TIMER BAR (IF ACTIVE PK STREAM) */}
            {activeHost.isPkBattle && activeHost.pkOpponent && (
              <div className="relative z-10 my-3 bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-red-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold font-mono">
                  <div className="flex items-center gap-2 text-red-400">
                    <Swords className="w-4 h-4 animate-bounce" />
                    <span>{activeHost.name}: {activeHost.diamondsEarned.toLocaleString()} 💎</span>
                  </div>

                  <div className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] border border-amber-500/30">
                    ⏱️ PK Battle: 02:45
                  </div>

                  <div className="text-blue-400">
                    {activeHost.pkOpponent.name}: {activeHost.pkOpponent.diamonds.toLocaleString()} 💎
                  </div>
                </div>

                {/* Score Ratio Progress Bar */}
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-500" 
                    style={{ width: `${(activeHost.diamondsEarned / (activeHost.diamondsEarned + activeHost.pkOpponent.diamonds)) * 100}%` }}
                  />
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex-1 transition-all duration-500" />
                </div>
              </div>
            )}

            {/* GIFT GOAL PROGRESS BAR */}
            <div className="relative z-10 mb-2 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                <span className="text-xs font-bold text-amber-300 truncate">{activeHost.giftGoalTitle}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (activeHost.giftGoalCurrent / activeHost.giftGoalTarget) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-300">
                  {activeHost.giftGoalCurrent} / {activeHost.giftGoalTarget} 💎
                </span>
              </div>
            </div>

            {/* ACTIVE GIFT BANNER ANIMATION OVERLAY ON VIDEO */}
            {activeGiftBanner && (
              <div className="relative z-20 my-auto mx-auto max-w-sm w-full p-4 rounded-3xl bg-gradient-to-r from-pink-600/90 via-purple-600/90 to-indigo-600/90 border-2 border-amber-400 text-white shadow-2xl backdrop-blur-md animate-bounce text-center space-y-1">
                <p className="text-2xl animate-pulse">{activeGiftBanner.gift.icon}</p>
                <h4 className="font-extrabold text-sm font-heading">{activeGiftBanner.sender} SENT A GIFT!</h4>
                <p className="text-xs font-mono font-bold text-amber-300">
                  {activeGiftBanner.gift.name} (+{activeGiftBanner.gift.coins} 💎 Diamonds)
                </p>
              </div>
            )}

            {/* FLOATING HEARTS ANIMATION CANNON */}
            <div className="absolute right-6 bottom-24 w-20 h-64 pointer-events-none z-20 overflow-hidden">
              {floatingHearts.map(h => (
                <div 
                  key={h.id} 
                  className="absolute bottom-0 text-2xl animate-float-up opacity-90 transition-all"
                  style={{ left: `${h.left}%` }}
                >
                  {h.emoji}
                </div>
              ))}
            </div>

            {/* BOTTOM CONTROLS & STREAM TITLE */}
            <div className="relative z-10 space-y-3 pt-2">
              <h2 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-md">
                {activeHost.title}
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
                {/* Left Stream Tools */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 transition-colors"
                    title={isPlaying ? "Pause Stream" : "Play Stream"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-pink-400" />}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 transition-colors"
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Right Interactive Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Floating Heart Reaction Cannon Trigger */}
                  <button
                    onClick={() => triggerHeartAnimation('💖')}
                    className="p-2.5 rounded-full bg-pink-600/80 hover:bg-pink-500 text-white border border-pink-400/40 shadow-lg shadow-pink-600/30 active:scale-95 transition-all"
                    title="Send Floating Heart Reaction"
                  >
                    <Heart className="w-4 h-4 fill-white animate-pulse" />
                  </button>

                  {/* Gift Store Drawer Trigger */}
                  <button
                    onClick={() => setIsGiftDrawerOpen(true)}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Send Gift 🎁</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE CHAT & TANGO GIFT STORE */}
        <div className="lg:col-span-4 space-y-4 flex flex-col h-full">
          <div className={`p-4 rounded-3xl border flex flex-col justify-between h-[480px] sm:h-[520px] transition-all ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-md text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-pink-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider font-mono">Live Stream Chat</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Realtime
              </span>
            </div>

            {/* Chat Messages Stream */}
            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 py-3 pr-1"
            >
              {chatMessages.map((m) => (
                <div 
                  key={m.id} 
                  className={`p-2 rounded-2xl text-xs space-y-0.5 border ${
                    m.giftSent 
                      ? 'bg-gradient-to-r from-amber-500/20 via-pink-500/10 to-purple-500/20 border-amber-500/40 text-amber-200'
                      : isDarkMode ? 'bg-slate-950/60 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-pink-600/30 text-pink-300 font-mono text-[9px] font-bold">
                        Lv.{m.userLevel}
                      </span>
                      {m.isVip && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                      <span className="font-bold text-xs">{m.username}:</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">{m.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed pl-1">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendComment} className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something nice..."
                className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-normal border focus:outline-none focus:border-pink-500 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30 transition-all"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* DISCOVERY GRID OF OTHER ACTIVE LIVE HOSTS */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-pink-500 animate-pulse" />
            <h2 className="text-lg font-bold font-heading">Explore Live Streams ({filteredHosts.length})</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time Streamers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredHosts.map((host) => (
            <div
              key={host.id}
              onClick={() => {
                triggerHaptic('selection');
                setActiveHost(host);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`group relative rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                activeHost.id === host.id
                  ? 'ring-4 ring-pink-500 shadow-xl'
                  : isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-pink-500/50' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {/* Thumbnail Image */}
              <div className="relative h-48 overflow-hidden">
                <img src={host.coverImage} alt={host.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Live Badge & Viewers */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-xl bg-pink-600 text-white text-[10px] font-bold font-mono shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                  </span>
                  {host.isPkBattle && (
                    <span className="px-2 py-0.5 rounded-xl bg-purple-600 text-white text-[10px] font-bold font-mono">
                      ⚔️ PK Duel
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-xl bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-mono font-bold flex items-center gap-1 border border-white/10">
                  <Eye className="w-3 h-3 text-pink-400" />
                  <span>{host.viewersCount.toLocaleString()}</span>
                </div>

                {/* Host Info Avatar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                  <img src={host.avatar} alt={host.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 font-bold text-xs text-white truncate">
                      <span>{host.name}</span>
                      {host.verified && <ShieldCheck className="w-3 h-3 text-indigo-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-300 font-mono truncate">💎 {(host.diamondsEarned / 1000).toFixed(1)}k Diamonds</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 space-y-2">
                <h3 className="text-xs font-bold line-clamp-2 leading-snug group-hover:text-pink-400 transition-colors">
                  {host.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="capitalize text-indigo-400 font-mono">#{host.category}</span>
                  <span className="text-pink-400 font-bold">Watch Stream →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TANGO GIFT STORE MODAL */}
      {isGiftDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg p-5 rounded-3xl border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base font-heading">Tango Gift Store</h3>
              </div>
              <button
                onClick={() => setIsGiftDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wallet Info */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-300 font-mono">{userCoins.toLocaleString()} Coins Available</span>
              </div>
              <button
                onClick={() => {
                  setIsGiftDrawerOpen(false);
                  setIsRechargeModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-[11px] hover:bg-amber-400 transition-colors"
              >
                Recharge 🪙
              </button>
            </div>

            {/* Gifts Grid */}
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto no-scrollbar p-1">
              {GIFTS_CATALOG.map((g) => {
                const isSelected = selectedGift.id === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedGift(g);
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/20 to-pink-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-3xl">{g.icon}</span>
                    <span className="font-bold text-xs text-white truncate max-w-full">{g.name}</span>
                    <span className="text-[10px] font-mono font-bold text-amber-300">{g.coins} 🪙</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsGiftDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendGift}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>Send {selectedGift.name} ({selectedGift.coins} 🪙)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COINS RECHARGE MODAL */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base font-heading">Recharge Tango Coins</h3>
              </div>
              <button onClick={() => setIsRechargeModalOpen(false)} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Coins allow you to send animated gifts, support streamers in PK Battles, and unlock VIP chat badges.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { coins: 500, price: '$4.99' },
                { coins: 1200, price: '$9.99', popular: true },
                { coins: 3000, price: '$24.99' },
                { coins: 7500, price: '$49.99' }
              ].map((pkg, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    triggerHaptic('success');
                    setUserCoins(prev => prev + pkg.coins);
                    setIsRechargeModalOpen(false);
                    if (showToast) showToast('Coins Recharged!', `Added +${pkg.coins} coins to wallet`, 'success');
                  }}
                  className={`p-3.5 rounded-2xl border text-center space-y-1 relative transition-all hover:scale-105 ${
                    pkg.popular ? 'bg-amber-500/20 border-amber-400' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 right-2 px-2 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold">
                      Popular
                    </span>
                  )}
                  <p className="font-mono font-black text-amber-300 text-base">{pkg.coins} 🪙</p>
                  <p className="text-xs font-bold text-slate-200">{pkg.price}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsRechargeModalOpen(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* GO LIVE BROADCAST MODAL */}
      {isGoLiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-500" />
                <h3 className="font-extrabold text-base font-heading">Broadcast Studio - Go Live</h3>
              </div>
              <button onClick={() => setIsGoLiveModalOpen(false)} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Preview Simulation */}
            <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img src={user.avatar} alt="Preview" className="w-24 h-24 rounded-full object-cover ring-4 ring-pink-500/50 animate-pulse" />
              <div className="absolute top-3 left-3 px-2 py-1 rounded-xl bg-black/60 text-white text-[10px] font-mono flex items-center gap-1 border border-white/10">
                <Wand2 className="w-3 h-3 text-pink-400" /> Filter: {selectedFilter}
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Stream Title</label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-pink-500 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Category Select */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'chat', label: '💬 Chat & Lounge' },
                { id: 'music', label: '🎵 Music Performance' },
                { id: 'gaming', label: '🎮 Live Gaming' },
                { id: 'pk', label: '⚔️ PK Battle Ready' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setStreamCategory(c.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    streamCategory === c.id
                      ? 'bg-pink-600 text-white border-pink-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsGoLiveModalOpen(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleStartBroadcast}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Start Live Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP STREAMERS LEADERBOARD DRAWER */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base font-heading">Daily Diamond Leaderboard</h3>
              </div>
              <button onClick={() => setIsLeaderboardOpen(false)} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
              {INITIAL_HOSTS.sort((a, b) => b.diamondsEarned - a.diamondsEarned).map((h, rank) => (
                <div key={h.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full font-bold font-mono text-xs flex items-center justify-center ${
                      rank === 0 ? 'bg-amber-400 text-slate-950' : rank === 1 ? 'bg-slate-300 text-slate-950' : rank === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{rank + 1}
                    </span>
                    <img src={h.avatar} alt={h.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-white">{h.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">@{h.username}</p>
                    </div>
                  </div>
                  <span className="font-bold font-mono text-amber-300 text-xs">
                    {(h.diamondsEarned / 1000).toFixed(1)}k 💎
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsLeaderboardOpen(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
