import { 
  db, 
  auth, 
  signInWithGoogle, 
  logoutUser 
} from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where, 
  serverTimestamp, 
  increment,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { SocialPost, Story, ChatMessage, NotificationItem, PostComment, UserProfile, CreatorAnalytics, Community, MarketplaceItem } from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error("Firestore DB Operation Error:", JSON.stringify(errInfo));
}

// Upload Media File Endpoint Call
export async function uploadMediaFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileData
          })
        });
        const data = await response.json();
        if (data.url) {
          resolve(data.url);
        } else {
          reject(new Error(data.error || "File upload failed"));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Upload Dedicated Video File Endpoint
export async function uploadVideoFile(file: File, title?: string, category?: string): Promise<{ url: string; post?: SocialPost }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const response = await fetch("/api/upload-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileData,
            title,
            category
          })
        });
        const data = await response.json();
        if (data.url) {
          resolve({ url: data.url, post: data.post });
        } else {
          reject(new Error(data.error || "Video upload failed"));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Subscribe to Realtime Feed Posts
export function subscribeToRealtimePosts(callback: (posts: SocialPost[]) => void) {
  const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
  
  return onSnapshot(postsQuery, (snapshot) => {
    const postList: SocialPost[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      postList.push({
        id: docSnapshot.id,
        ...data
      } as SocialPost);
    });
    callback(postList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "posts");
  });
}

// Subscribe to Realtime Comments for a Post
export function subscribeToPostComments(postId: string, callback: (comments: PostComment[]) => void) {
  const commentsQuery = query(
    collection(db, `posts/${postId}/comments`), 
    orderBy("createdAt", "asc")
  );

  return onSnapshot(commentsQuery, (snapshot) => {
    const commentsList: PostComment[] = [];
    snapshot.forEach((docSnap) => {
      commentsList.push({
        id: docSnap.id,
        ...docSnap.data()
      } as PostComment);
    });
    callback(commentsList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `posts/${postId}/comments`);
  });
}

// Add New Comment with Realtime Persistence
export async function createPostComment(postId: string, comment: Partial<PostComment>): Promise<void> {
  const path = `posts/${postId}/comments`;
  try {
    const commentsRef = collection(db, path);
    await addDoc(commentsRef, {
      postId,
      authorUid: auth.currentUser?.uid || "usr_me",
      authorName: comment.authorName || auth.currentUser?.displayName || "Anonymous Creator",
      authorAvatar: comment.authorAvatar || auth.currentUser?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      content: comment.content,
      likesCount: 0,
      createdAt: new Date().toISOString()
    });

    // Increment comment count on post
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Subscribe to Realtime Direct Chat Messages
export function subscribeToChatMessages(callback: (messages: ChatMessage[]) => void) {
  const chatQuery = query(collection(db, "chat_messages"), orderBy("createdAt", "asc"), limit(100));

  return onSnapshot(chatQuery, (snapshot) => {
    const chatList: ChatMessage[] = [];
    snapshot.forEach((docSnap) => {
      chatList.push({
        id: docSnap.id,
        ...docSnap.data()
      } as ChatMessage);
    });
    callback(chatList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "chat_messages");
  });
}

// Send Realtime Chat Message
export async function sendChatMessage(message: Partial<ChatMessage>): Promise<void> {
  const path = "chat_messages";
  try {
    const chatRef = collection(db, path);
    await addDoc(chatRef, {
      senderId: auth.currentUser?.uid || "usr_me",
      senderUid: auth.currentUser?.uid || "usr_me",
      senderName: auth.currentUser?.displayName || "Alex Rivera",
      senderAvatar: auth.currentUser?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      content: message.content,
      mediaUrl: message.mediaUrl || null,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Subscribe to Realtime Notifications
export function subscribeToNotifications(userUid: string, callback: (notifications: NotificationItem[]) => void) {
  const notifQuery = query(
    collection(db, "notifications"), 
    where("userUid", "==", userUid),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(notifQuery, (snapshot) => {
    const notifs: NotificationItem[] = [];
    snapshot.forEach((docSnap) => {
      notifs.push({
        id: docSnap.id,
        ...docSnap.data()
      } as NotificationItem);
    });
    callback(notifs);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "notifications");
  });
}

// Create New Post in Database
export async function createDatabasePost(post: Partial<SocialPost>): Promise<string | undefined> {
  const path = "posts";
  try {
    const postsRef = collection(db, path);
    const docRef = await addDoc(postsRef, {
      ...post,
      authorUid: auth.currentUser?.uid || post.author?.id || "usr_me",
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      repostsCount: post.repostsCount || 0,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Like / Toggle Post Reaction
export async function togglePostLikeInDb(postId: string, isLiked: boolean): Promise<void> {
  const path = `posts/${postId}`;
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      likesCount: increment(isLiked ? -1 : 1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Create New Story
export async function createDatabaseStory(story: Partial<Story>): Promise<void> {
  const path = "stories";
  try {
    const storiesRef = collection(db, path);
    await addDoc(storiesRef, {
      ...story,
      authorUid: auth.currentUser?.uid || "usr_me",
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Subscribe to Realtime Stories
export function subscribeToStories(callback: (stories: Story[]) => void) {
  const storiesQuery = query(collection(db, "stories"), orderBy("createdAt", "desc"), limit(30));
  
  return onSnapshot(storiesQuery, (snapshot) => {
    const storyList: Story[] = [];
    snapshot.forEach((docSnap) => {
      storyList.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Story);
    });
    callback(storyList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "stories");
  });
}

// Bookmark / Repost Post
export async function toggleBookmarkInDb(postId: string, isBookmarked: boolean): Promise<void> {
  const path = `posts/${postId}`;
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      bookmarksCount: increment(isBookmarked ? -1 : 1)
    });

    if (auth.currentUser?.uid) {
      const userBookmarkRef = doc(db, `users/${auth.currentUser.uid}/bookmarks`, postId);
      if (isBookmarked) {
        await deleteDoc(userBookmarkRef);
      } else {
        await setDoc(userBookmarkRef, {
          postId,
          savedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleRepostInDb(postId: string, isReposted: boolean): Promise<void> {
  const path = `posts/${postId}`;
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      repostsCount: increment(isReposted ? -1 : 1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// User Profile Firestore Operations
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleFollowUser(targetUid: string, isFollowing: boolean): Promise<void> {
  if (!auth.currentUser?.uid) return;
  const currentUid = auth.currentUser.uid;
  
  try {
    const followRef = doc(db, `users/${currentUid}/following`, targetUid);
    const followerRef = doc(db, `users/${targetUid}/followers`, currentUid);
    
    if (isFollowing) {
      await deleteDoc(followRef);
      await deleteDoc(followerRef);
      await updateDoc(doc(db, "users", currentUid), { followingCount: increment(-1) });
      await updateDoc(doc(db, "users", targetUid), { followersCount: increment(-1) });
    } else {
      await setDoc(followRef, { uid: targetUid, followedAt: new Date().toISOString() });
      await setDoc(followerRef, { uid: currentUid, followedAt: new Date().toISOString() });
      await updateDoc(doc(db, "users", currentUid), { followingCount: increment(1) });
      await updateDoc(doc(db, "users", targetUid), { followersCount: increment(1) });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${targetUid}/followers`);
  }
}

// Communities Firestore Operations
export function subscribeToCommunities(callback: (communities: any[]) => void) {
  const q = query(collection(db, "communities"), orderBy("membersCount", "desc"), limit(30));
  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "communities");
  });
}

export async function createCommunityInDb(community: any): Promise<void> {
  const path = "communities";
  try {
    await addDoc(collection(db, path), {
      ...community,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Marketplace Firestore Operations
export function subscribeToMarketplaceItems(callback: (items: any[]) => void) {
  const q = query(collection(db, "marketplace"), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(q, (snapshot) => {
    const items: any[] = [];
    snapshot.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() }));
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "marketplace");
  });
}

export async function createMarketplaceItemInDb(item: any): Promise<void> {
  const path = "marketplace";
  try {
    await addDoc(collection(db, path), {
      ...item,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Paginated Feed Fetching for Infinite Scroll
export async function fetchFeedPaginated(lastSnapshot?: QueryDocumentSnapshot<DocumentData>, pageSize: number = 10) {
  const path = "posts";
  try {
    let feedQuery = query(
      collection(db, path), 
      orderBy("createdAt", "desc"), 
      limit(pageSize)
    );

    if (lastSnapshot) {
      feedQuery = query(
        collection(db, path), 
        orderBy("createdAt", "desc"), 
        startAfter(lastSnapshot), 
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(feedQuery);
    const posts: SocialPost[] = [];
    snapshot.forEach((docSnap) => {
      posts.push({ id: docSnap.id, ...docSnap.data() } as SocialPost);
    });

    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    return { posts, lastVisibleDoc };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return { posts: [], lastVisibleDoc: undefined };
  }
}

// User Profile with Firestore Fallback & Seeding
export async function getOrCreateUserProfile(firebaseUser: any): Promise<UserProfile> {
  const uid = firebaseUser?.uid || "usr_me";
  const userRef = doc(db, "users", uid);
  
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        ...data,
        securitySettings: {
          twoFactorEnabled: true,
          passkeyActive: true,
          biometricEnabled: true,
          loginAlerts: true,
          ...(data.securitySettings || {})
        }
      } as UserProfile;
    }

    const newProfile: UserProfile = {
      id: uid,
      name: firebaseUser?.displayName || "Alex Rivera",
      username: (typeof firebaseUser?.email === "string" && firebaseUser.email.includes("@")) ? firebaseUser.email.split("@")[0] : "alexrivera",
      avatar: firebaseUser?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      bio: "AI Systems Architect & Digital Creator 🚀 Building the next generation of intelligent social experiences on MuniSocial.",
      verified: true,
      proBadge: true,
      role: "creator",
      location: "San Francisco, CA / Global Remote",
      website: "https://municryptrix.ai",
      profession: "Principal AI Engineer",
      followersCount: 142800,
      followingCount: 890,
      friendsCount: 1240,
      postsCount: 384,
      totalViews: 4890000,
      joinedDate: "January 2025",
      skills: ["TypeScript", "Gemini AI", "FastAPI", "Distributed Systems", "UI/UX", "LLM Architectures"],
      achievements: ["MuniSocial Founding Creator", "Top 1% AI Visionary", "1M+ Video Views Badge", "Verified Pioneer"],
      badges: ["⚡ AI Innovator", "💎 Diamond Contributor", "🏆 Top Creator 2026", "🛡️ Security Champion"],
      securitySettings: {
        twoFactorEnabled: true,
        passkeyActive: true,
        biometricEnabled: true,
        loginAlerts: true,
      },
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return {
      id: uid,
      name: firebaseUser?.displayName || "Alex Rivera",
      username: "alexrivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      bio: "AI Systems Architect & Digital Creator 🚀 Building the next generation of intelligent social experiences on MuniSocial.",
      verified: true,
      proBadge: true,
      role: "creator",
      location: "San Francisco, CA",
      website: "https://municryptrix.ai",
      profession: "Principal AI Engineer",
      followersCount: 142800,
      followingCount: 890,
      friendsCount: 1240,
      postsCount: 384,
      totalViews: 4890000,
      joinedDate: "January 2025",
      skills: ["TypeScript", "Gemini AI", "FastAPI"],
      achievements: ["MuniSocial Founding Creator"],
      badges: ["⚡ AI Innovator"],
      securitySettings: { twoFactorEnabled: true, passkeyActive: true, biometricEnabled: true, loginAlerts: true }
    };
  }
}

// Realtime Analytics Listener
export function subscribeToAnalytics(uid: string, callback: (analytics: CreatorAnalytics) => void) {
  const analyticsRef = doc(db, "analytics", uid);
  const defaultAnalytics: CreatorAnalytics = {
    totalRevenue: 24890.50,
    adRevenue: 12450.00,
    subscriberRevenue: 8920.50,
    tipsAndStars: 3520.00,
    monthlyViews: 1485000,
    watchTimeHours: 94200,
    subscriberCount: 142800,
    engagementRate: 8.4,
    topVideos: [
      { title: "Building Autonomous AI Agents with Gemini 3.6 Flash & WebSockets", views: 420000, revenue: 4850.00 },
      { title: "MuniSocial Platform Architecture: Distributed State & Realtime Audio", views: 310000, revenue: 3620.00 },
      { title: "Next-Gen UI Systems: Motion, Tailwind CSS v4 & Zero-Latency Audio", views: 245000, revenue: 2890.00 },
      { title: "Full-Stack AI Workflows: From Prompt Engineering to Production Cloud Run", views: 189000, revenue: 2150.00 },
    ],
    audienceDemographics: [
      { country: "United States", percentage: 42 },
      { country: "Germany", percentage: 14 },
      { country: "United Kingdom", percentage: 11 },
      { country: "Japan", percentage: 9 },
      { country: "India", percentage: 8 },
      { country: "Canada", percentage: 6 },
      { country: "Other", percentage: 10 },
    ]
  };

  return onSnapshot(analyticsRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as CreatorAnalytics);
    } else {
      callback(defaultAnalytics);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `analytics/${uid}`);
    callback(defaultAnalytics);
  });
}

// Sync Saved Posts / Bookmarks to Cloud Firestore
export async function syncSavedBookmarksToCloud(
  userUid: string, 
  savedPostIds: Record<string, boolean>, 
  savedOrder: string[]
): Promise<void> {
  const path = `user_bookmarks/${userUid}`;
  try {
    const docRef = doc(db, "user_bookmarks", userUid);
    await setDoc(docRef, {
      userId: userUid,
      savedPostIds,
      savedOrder,
      updatedAt: serverTimestamp(),
      count: Object.values(savedPostIds).filter(Boolean).length
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch Saved Posts / Bookmarks from Cloud Firestore
export async function fetchSavedBookmarksFromCloud(
  userUid: string
): Promise<{ savedPostIds: Record<string, boolean>; savedOrder: string[] } | null> {
  const path = `user_bookmarks/${userUid}`;
  try {
    const docRef = doc(db, "user_bookmarks", userUid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        savedPostIds: data.savedPostIds || {},
        savedOrder: data.savedOrder || []
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
