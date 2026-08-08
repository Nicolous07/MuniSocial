import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, 
  HardDrive, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Search, 
  X, 
  Trash2, 
  Download, 
  GripVertical, 
  CheckSquare, 
  Square, 
  ChevronUp, 
  ChevronDown, 
  Heart, 
  MessageCircle, 
  Tag, 
  Check, 
  Layers,
  FileJson,
  Sparkles,
  Info
} from 'lucide-react';
import { SocialPost, UserProfile } from '../types';
import { syncSavedBookmarksToCloud, fetchSavedBookmarksFromCloud } from '../lib/dbService';

interface SavedPostsManagerProps {
  posts?: SocialPost[];
  isDarkMode?: boolean;
  user?: UserProfile;
  onBookmarkToggle?: (postId: string) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SavedPostsManager: React.FC<SavedPostsManagerProps> = ({
  posts = [],
  isDarkMode = true,
  user,
  onBookmarkToggle,
  onShowToast
}) => {
  // 1. Saved Post IDs from localStorage
  const [savedPostIds, setSavedPostIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('munisocial_saved_posts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved posts', e);
    }
    return { post_code_1: true };
  });

  // 2. Saved Order array from localStorage
  const [savedOrder, setSavedOrder] = useState<string[]>(() => {
    try {
      const order = localStorage.getItem('munisocial_saved_posts_order');
      if (order) return JSON.parse(order);
    } catch (e) {
      console.error('Error loading saved order', e);
    }
    return ['post_code_1'];
  });

  // 3. Cloud Sync State
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('munisocial_cloud_sync_saved') === 'true';
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // 4. Search and Tag Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // 5. Multi-Select States
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedForBulk, setSelectedForBulk] = useState<Record<string, boolean>>({});

  // 6. Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Initial Sync check
  const userId = user?.id || 'usr_me';

  // Listen to external bookmark updates in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('munisocial_saved_posts');
        if (saved) setSavedPostIds(JSON.parse(saved));
        const order = localStorage.getItem('munisocial_saved_posts_order');
        if (order) setSavedOrder(JSON.parse(order));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update localStorage helper
  const persistBookmarks = (updatedIds: Record<string, boolean>, updatedOrder: string[]) => {
    setSavedPostIds(updatedIds);
    setSavedOrder(updatedOrder);
    try {
      localStorage.setItem('munisocial_saved_posts', JSON.stringify(updatedIds));
      localStorage.setItem('munisocial_saved_posts_order', JSON.stringify(updatedOrder));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    // Trigger Cloud Sync if active
    if (isCloudSyncEnabled) {
      handleCloudSync(updatedIds, updatedOrder);
    }
  };

  // Cloud Sync Handler
  const handleCloudSync = async (idsToSync = savedPostIds, orderToSync = savedOrder) => {
    setIsSyncing(true);
    try {
      await syncSavedBookmarksToCloud(userId, idsToSync, orderToSync);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      if (onShowToast) {
        onShowToast('Cloud Sync Completed ☁️', `Persisted ${Object.values(idsToSync).filter(Boolean).length} bookmarks to Firestore.`, 'success');
      }
    } catch (err) {
      console.error('Cloud Sync Error', err);
      if (onShowToast) {
        onShowToast('Cloud Sync Warning', 'Syncing saved posts to Firestore failed. Stored locally.', 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle Cloud Sync Mode
  const toggleCloudSync = async () => {
    const nextVal = !isCloudSyncEnabled;
    setIsCloudSyncEnabled(nextVal);
    localStorage.setItem('munisocial_cloud_sync_saved', String(nextVal));

    if (nextVal) {
      setIsSyncing(true);
      // Try to fetch from cloud first to merge
      const cloudData = await fetchSavedBookmarksFromCloud(userId);
      if (cloudData) {
        const mergedIds = { ...savedPostIds, ...cloudData.savedPostIds };
        const mergedOrder = Array.from(new Set([...savedOrder, ...cloudData.savedOrder]));
        persistBookmarks(mergedIds, mergedOrder);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (onShowToast) {
          onShowToast('Cloud Sync Enabled ☁️', 'Synced & merged local bookmarks with Firestore database.', 'success');
        }
      } else {
        await handleCloudSync(savedPostIds, savedOrder);
      }
      setIsSyncing(false);
    } else {
      if (onShowToast) {
        onShowToast('Cloud Sync Disabled', 'Bookmarks will remain stored in browser local storage.', 'info');
      }
    }
  };

  // Extract all saved post objects according to savedOrder, appending any un-ordered saved post
  const activeSavedIds = Object.keys(savedPostIds).filter(id => savedPostIds[id]);
  const postMap = new Map((posts || []).map(p => [p.id, p]));

  // Reorder saved posts based on savedOrder array
  const orderedPostIds = [
    ...savedOrder.filter(id => savedPostIds[id]),
    ...activeSavedIds.filter(id => !savedOrder.includes(id))
  ];

  const savedPostsList: SocialPost[] = orderedPostIds
    .map(id => postMap.get(id))
    .filter((p): p is SocialPost => p !== undefined);

  // Extract Available Tags for Filtering
  const allTags = Array.from(
    new Set([
      'All',
      ...savedPostsList.flatMap(p => [
        p.type,
        ...(p.content.match(/#[\w]+/g) || []).map(t => t.replace('#', ''))
      ])
    ])
  );

  // Filter Saved Posts by Search Query and Selected Tag
  const filteredSavedPosts = savedPostsList.filter(post => {
    const matchesTag = 
      selectedTag === 'All' || 
      post.type.toLowerCase() === selectedTag.toLowerCase() ||
      post.content.toLowerCase().includes(`#${selectedTag.toLowerCase()}`) ||
      post.content.toLowerCase().includes(selectedTag.toLowerCase());

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      !query ||
      post.content.toLowerCase().includes(query) ||
      post.author.name.toLowerCase().includes(query) ||
      post.author.username.toLowerCase().includes(query) ||
      post.type.toLowerCase().includes(query);

    return matchesTag && matchesSearch;
  });

  // Drag and Drop reorder logic
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...orderedPostIds];
    const [movedId] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, movedId);

    persistBookmarks(savedPostIds, newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (onShowToast) {
      onShowToast('Post Reordered 🔄', 'Updated manual priority order in saved collection.', 'info');
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Quick Move Up / Down
  const movePostPosition = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedPostIds.length) return;

    const newOrder = [...orderedPostIds];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    persistBookmarks(savedPostIds, newOrder);
    if (onShowToast) {
      onShowToast('Position Updated ⬆️⬇️', `Moved item ${direction === 'up' ? 'higher' : 'lower'} in saved list.`, 'info');
    }
  };

  // Remove Single Saved Post
  const removeSinglePost = (postId: string) => {
    const updatedIds = { ...savedPostIds };
    delete updatedIds[postId];
    const updatedOrder = savedOrder.filter(id => id !== postId);

    persistBookmarks(updatedIds, updatedOrder);
    if (onBookmarkToggle) onBookmarkToggle(postId);

    if (onShowToast) {
      onShowToast('Bookmark Removed 🗑️', 'Post removed from your saved collection.', 'info');
    }
  };

  // Clear All Saved Posts
  const clearAllSavedPosts = () => {
    persistBookmarks({}, []);
    setSelectedForBulk({});
    setIsMultiSelectMode(false);
    if (onShowToast) {
      onShowToast('Saved Collection Cleared', 'All saved posts removed from local storage.', 'info');
    }
  };

  // Multi-Select Bulk Actions
  const toggleBulkSelectPost = (postId: string) => {
    setSelectedForBulk(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleSelectAll = () => {
    const selectedCount = Object.values(selectedForBulk).filter(Boolean).length;
    if (selectedCount === filteredSavedPosts.length) {
      setSelectedForBulk({});
    } else {
      const allSelected: Record<string, boolean> = {};
      filteredSavedPosts.forEach(p => {
        allSelected[p.id] = true;
      });
      setSelectedForBulk(allSelected);
    }
  };

  const deleteSelectedBulk = () => {
    const idsToDelete = Object.keys(selectedForBulk).filter(id => selectedForBulk[id]);
    if (idsToDelete.length === 0) return;

    const updatedIds = { ...savedPostIds };
    idsToDelete.forEach(id => {
      delete updatedIds[id];
    });
    const updatedOrder = savedOrder.filter(id => !idsToDelete.includes(id));

    persistBookmarks(updatedIds, updatedOrder);
    setSelectedForBulk({});
    setIsMultiSelectMode(false);

    if (onShowToast) {
      onShowToast('Bulk Delete Completed 🗑️', `Successfully deleted ${idsToDelete.length} selected saved posts.`, 'success');
    }
  };

  // Export Saved Posts as JSON File
  const exportSavedPostsAsJSON = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      appName: 'MuniSocial',
      totalBookmarks: savedPostsList.length,
      user: {
        id: user?.id || 'usr_me',
        username: user?.username || 'alexrivera',
      },
      bookmarks: savedPostsList.map((p, idx) => ({
        id: p.id,
        author: {
          name: p.author.name,
          username: p.author.username,
          avatar: p.author.avatar
        },
        content: p.content,
        createdAt: p.createdAt,
        type: p.type,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        mediaUrls: p.mediaUrls || [],
        mediaUrl: (p.mediaUrls && p.mediaUrls.length > 0) ? p.mediaUrls[0] : null,
        reorderPriorityIndex: idx + 1
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const link = document.createElement('a');
    link.href = url;
    link.download = `munisocial-bookmarks-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast('Export Successful 📄', `Exported ${savedPostsList.length} bookmarked posts as JSON backup.`, 'success');
    }
  };

  const bulkSelectedCount = Object.values(selectedForBulk).filter(Boolean).length;

  return (
    <div className="space-y-4">

      {/* HEADER BANNER & CLOUD SYNC CONTROL BAR */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${
        isDarkMode ? 'bg-amber-950/20 border-amber-500/30 text-slate-200' : 'bg-amber-50/80 border-amber-200 text-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
              <Bookmark className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm">Saved for Later Collection</h3>
                
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-amber-500" />
                  <span>Local Storage ({savedPostsList.length})</span>
                </span>

                {isCloudSyncEnabled && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                    <Cloud className="w-3 h-3 text-emerald-500" />
                    <span>Firestore Synced {lastSyncTime ? `(${lastSyncTime})` : ''}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Curated bookmarks stored locally and optionally synchronized to your Firestore cloud account across devices.
              </p>
            </div>
          </div>

          {/* CLOUD SYNC & EXPORT & BULK ACTIONS */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {/* Cloud Sync Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={toggleCloudSync}
              disabled={isSyncing}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                isCloudSyncEnabled 
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/40 shadow-xs' 
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Toggle automatic sync to Firestore database across devices"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : isCloudSyncEnabled ? (
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{isCloudSyncEnabled ? 'Cloud Sync ON' : 'Sync to Cloud'}</span>
            </motion.button>

            {/* Export JSON Button */}
            {savedPostsList.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={exportSavedPostsAsJSON}
                className="px-3 py-1.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Export all saved bookmarks as a JSON backup file"
              >
                <FileJson className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export JSON</span>
              </motion.button>
            )}

            {/* Multi-Select Mode Toggle */}
            {savedPostsList.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  setSelectedForBulk({});
                }}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                  isMultiSelectMode 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Toggle multi-select mode for bulk post deletion"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{isMultiSelectMode ? 'Cancel Selection' : 'Multi-Select'}</span>
              </motion.button>
            )}

            {/* Clear All Saved Button */}
            {savedPostsList.length > 0 && !isMultiSelectMode && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={clearAllSavedPosts}
                className="px-3 py-1.5 rounded-2xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                title="Remove all saved posts from local collection"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* MULTI-SELECT FLOATING ACTION BAR */}
      <AnimatePresence>
        {isMultiSelectMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-xl ${
              isDarkMode ? 'bg-slate-900 border-amber-500/40 text-slate-200' : 'bg-white border-amber-400 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                {bulkSelectedCount === filteredSavedPosts.length && filteredSavedPosts.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>{bulkSelectedCount === filteredSavedPosts.length ? 'Deselect All' : 'Select All'}</span>
              </motion.button>

              <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                {bulkSelectedCount} Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.02 }}
                onClick={deleteSelectedBulk}
                disabled={bulkSelectedCount === 0}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  bulkSelectedCount > 0 
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-400 shadow-md shadow-red-500/30' 
                    : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({bulkSelectedCount})</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH AND TAG FILTER BAR */}
      {savedPostsList.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            {/* Search Input Box */}
            <div className={`relative flex-1 rounded-2xl border flex items-center px-3 py-2 ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input 
                type="text"
                placeholder="Search bookmarks by content, author, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none placeholder-slate-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Item Count Indicator */}
            <div className="text-[11px] font-mono text-slate-400 self-center px-2">
              Showing <span className="text-amber-400 font-bold">{filteredSavedPosts.length}</span> of {savedPostsList.length}
            </div>

          </div>

          {/* Category Tag Pills */}
          {allTags.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3 text-amber-500" /> Tags:
              </span>
              {allTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 border ${
                      isSelected 
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs' 
                        : isDarkMode
                          ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DRAG INSTRUCTION NOTICE */}
      {savedPostsList.length > 1 && !isMultiSelectMode && !searchQuery && selectedTag === 'All' && (
        <div className="flex items-center gap-2 text-[11px] text-slate-400 px-2 font-mono">
          <GripVertical className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Drag card handles or use ⬆️⬇️ arrows to reorder & prioritize bookmarks.</span>
        </div>
      )}

      {/* SAVED POSTS GRID / LIST */}
      {filteredSavedPosts.length === 0 ? (
        <div className={`p-8 rounded-3xl border text-center space-y-3 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
        }`}>
          <Bookmark className="w-10 h-10 mx-auto text-amber-500 animate-bounce" />
          <h3 className="font-bold text-sm text-slate-200">
            {savedPostsList.length === 0 ? 'No Saved Posts Yet 🔖' : 'No Matching Bookmarks Found'}
          </h3>
          <p className="text-xs max-w-md mx-auto text-slate-400">
            {savedPostsList.length === 0 
              ? "You haven't saved any posts to local storage yet. Click 'Save for Later' on any post in your feed to bookmark it and access it offline anytime."
              : "Try clearing your search query or selecting a different tag filter to view saved posts."
            }
          </p>
          {(searchQuery || selectedTag !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All');
              }}
              className="px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {(filteredSavedPosts || [])?.map((post, idx) => {
              const isBulkSelected = !!selectedForBulk[post.id];
              const isBeingDragged = draggedIndex === idx;
              const isBeingDraggedOver = dragOverIndex === idx;

              return (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  draggable={!isMultiSelectMode}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (isMultiSelectMode) {
                      toggleBulkSelectPost(post.id);
                    }
                  }}
                  className={`p-5 rounded-3xl border space-y-3 transition-all relative ${
                    isBeingDragged ? 'opacity-40 border-amber-500 scale-[0.98]' : ''
                  } ${
                    isBeingDraggedOver ? 'border-2 border-amber-400 ring-4 ring-amber-500/20' : ''
                  } ${
                    isBulkSelected
                      ? isDarkMode ? 'bg-amber-950/30 border-amber-500/50 ring-2 ring-amber-500/30' : 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                      : isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                  }`}
                >

                  {/* TOP CARD BAR WITH DRAG HANDLE, AUTHOR INFO, AND ACTIONS */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      
                      {/* Bulk Select Checkbox OR Drag Handle */}
                      {isMultiSelectMode ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBulkSelectPost(post.id);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800 transition-colors text-amber-500"
                        >
                          {isBulkSelected ? (
                            <CheckSquare className="w-5 h-5 text-amber-400 fill-amber-500/20" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500" />
                          )}
                        </button>
                      ) : (
                        <div 
                          className="cursor-grab active:cursor-grabbing p-1.5 rounded-xl hover:bg-slate-800/80 text-slate-500 hover:text-amber-400 transition-colors"
                          title="Click and drag to reorder post"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}

                      {/* Author Avatar & Info */}
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{post.author.name}</span>
                          <span className="text-slate-400 text-[11px]">@{post.author.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">{post.createdAt}</span>
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-mono uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                            {post.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD CONTROLS: REORDER ARROWS & REMOVE BUTTON */}
                    {!isMultiSelectMode && (
                      <div className="flex items-center gap-1">
                        
                        {/* Position UP button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            movePostPosition(idx, 'up');
                          }}
                          disabled={idx === 0}
                          className="p-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Move bookmark up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Position DOWN button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            movePostPosition(idx, 'down');
                          }}
                          disabled={idx === filteredSavedPosts.length - 1}
                          className="p-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Move bookmark down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove Bookmark button */}
                        <motion.button
                          whileTap={{ scale: 0.88, rotate: -5 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSinglePost(post.id);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700/80 hover:border-red-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors ml-1"
                          title="Remove from saved collection"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* POST CONTENT */}
                  <p className="text-xs leading-relaxed text-slate-200 pl-8">{post.content}</p>

                  {/* MEDIA PREVIEW IF AVAILABLE */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="rounded-2xl overflow-hidden max-h-72 bg-slate-950 border border-slate-800/80 ml-8">
                      <img src={post.mediaUrls[0]} alt="Post media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* BOTTOM FOOTER BADGES & STATS */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400 pl-8">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-mono bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <HardDrive className="w-3 h-3 text-amber-500" />
                        <span>Stored Locally</span>
                      </span>

                      <span className="text-[10px] font-mono text-slate-500">
                        Priority #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {post.likesCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-indigo-400" /> {post.commentsCount}</span>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};
