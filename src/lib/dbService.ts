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
import { SocialPost, Story, ChatMessage, NotificationItem, PostComment, UserProfile } from "../types";

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
