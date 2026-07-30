export type ViewMode = 
  | 'feed' 
  | 'shorts' 
  | 'watch' 
  | 'threads' 
  | 'communities' 
  | 'marketplace' 
  | 'messages' 
  | 'muniai' 
  | 'creator-studio' 
  | 'admin' 
  | 'profile' 
  | 'auth' 
  | 'notifications';

export type ContentType = 
  | 'text' 
  | 'image' 
  | 'carousel' 
  | 'short_video' 
  | 'long_video' 
  | 'poll' 
  | 'thread' 
  | 'code' 
  | 'article' 
  | 'marketplace' 
  | 'event' 
  | 'live_stream';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  bio: string;
  verified: boolean;
  proBadge: boolean;
  role: 'user' | 'creator' | 'admin' | 'moderator';
  location: string;
  website: string;
  profession: string;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  postsCount: number;
  totalViews: number;
  joinedDate: string;
  skills: string[];
  achievements: string[];
  badges: string[];
  securitySettings: {
    twoFactorEnabled: boolean;
    passkeyActive: boolean;
    biometricEnabled: boolean;
    loginAlerts: boolean;
  };
}

export interface PostComment {
  id: string;
  postId?: string;
  authorUid?: string;
  authorName?: string;
  authorAvatar?: string;
  author?: {
    name: string;
    username?: string;
    avatar: string;
    verified?: boolean;
  };
  text?: string;
  content?: string;
  createdAt?: string;
  likesCount?: number;
  isLiked?: boolean;
  replies?: PostComment[];
}

export interface SocialPost {
  id: string;
  author: UserProfile;
  type: ContentType;
  content: string;
  mediaUrls?: string[];
  videoDetails?: {
    duration: string;
    aspectRatio: '9:16' | '16:9';
    views: number;
    quality: '4K' | '1080p' | '8K';
    audioTrack?: string;
    chapters?: { time: string; title: string }[];
    aiSummary?: string;
    isLive?: boolean;
  };
  pollDetails?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    userVotedIndex?: number;
  };
  codeDetails?: {
    language: string;
    code: string;
  };
  threadSequence?: string[];
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarksCount: number;
  createdAt: string;
  tags: string[];
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  aiScore?: number; // AI ranking priority score (1-100)
  aiTopic?: string;
  comments?: PostComment[];
}

export interface StoryViewer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  viewedAt: string;
}

export interface Story {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  mediaUrl: string;
  type: 'image' | 'video';
  caption?: string;
  hasUnseen?: boolean;
  createdAt: string;
  seenBy?: StoryViewer[];
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  banner: string;
  avatar: string;
  description: string;
  category: string;
  membersCount: number;
  isJoined?: boolean;
  isPrivate: boolean;
  rules: string[];
  channels: { id: string; name: string; type: 'text' | 'voice' | 'forum' }[];
}

export interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: 'electronics' | 'digital' | 'courses' | 'apparel' | 'collectibles';
  image: string;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    salesCount: number;
  };
  description: string;
  condition: 'New' | 'Digital Instant' | 'Like New';
  location: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  content?: string;
  timestamp: string;
  isAi?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  codeBlock?: { language: string; code: string };
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'repost' | 'follow' | 'mention' | 'live' | 'ai';
  actor: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  targetId?: string;
  timestamp: string;
  isRead: boolean;
}

export interface CreatorAnalytics {
  totalRevenue: number;
  adRevenue: number;
  subscriberRevenue: number;
  tipsAndStars: number;
  monthlyViews: number;
  watchTimeHours: number;
  subscriberCount: number;
  engagementRate: number;
  topVideos: { title: string; views: number; revenue: number }[];
  audienceDemographics: { country: string; percentage: number }[];
}
