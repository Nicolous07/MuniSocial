import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface UserInteractionEvent {
  id: string;
  timestamp: string;
  type: 'navigation' | 'interaction' | 'search' | 'action';
  fromView?: string;
  toView?: string;
  actionName?: string;
  category?: string;
  details?: Record<string, any>;
  userName?: string;
}

const STORAGE_KEY = 'muni_user_interactions';
const MAX_EVENTS_IN_LOCAL = 50;

/**
 * Retrieve saved user activity history from localStorage
 */
export const getRecentActivities = (limitCount = 20): UserInteractionEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: UserInteractionEvent[] = JSON.parse(raw);
    return parsed.slice(0, limitCount);
  } catch (e) {
    console.warn('Error reading interaction history:', e);
    return [];
  }
};

/**
 * Save an event to localStorage and asynchronously sync with Firestore
 */
const saveEvent = (event: UserInteractionEvent) => {
  try {
    const existing = getRecentActivities(MAX_EVENTS_IN_LOCAL);
    const updated = [event, ...existing].slice(0, MAX_EVENTS_IN_LOCAL);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving interaction locally:', e);
  }

  // Asynchronous non-blocking save to Firebase Firestore
  try {
    const colRef = collection(db, 'user_interaction_logs');
    addDoc(colRef, {
      ...event,
      createdAt: serverTimestamp()
    }).catch(err => {
      // Quiet fail if offline or database rules restricted
      console.debug('Firestore interaction log debug:', err?.message);
    });
  } catch (e) {
    // Non-blocking catch
  }
};

/**
 * Track when a user navigates between views
 */
export const trackNavigation = (fromView: string, toView: string, userName = 'Nicolous Munisi', metadata?: Record<string, any>) => {
  if (fromView === toView) return;
  const event: UserInteractionEvent = {
    id: `nav_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type: 'navigation',
    fromView,
    toView,
    userName,
    details: metadata || {}
  };
  saveEvent(event);
};

/**
 * Track user clicks, button triggers, modals, tab changes, and queries
 */
export const trackInteraction = (actionName: string, category: string, details?: Record<string, any>, userName = 'Nicolous Munisi') => {
  const event: UserInteractionEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type: 'interaction',
    actionName,
    category,
    userName,
    details: details || {}
  };
  saveEvent(event);
};

/**
 * Format active user interaction context for MuniAI Copilot
 */
export const getFormattedContextForAI = (): string => {
  const activities = getRecentActivities(8);
  if (activities.length === 0) {
    return 'User has just opened the app session.';
  }

  const lines = activities.map(act => {
    if (act.type === 'navigation') {
      return `• [${act.timestamp}] Navigated from '${act.fromView}' to '${act.toView}'`;
    }
    return `• [${act.timestamp}] ${act.category?.toUpperCase() || 'ACTION'}: ${act.actionName}${
      act.details && Object.keys(act.details).length ? ` (${JSON.stringify(act.details)})` : ''
    }`;
  });

  return lines.join('\n');
};

/**
 * Clear interaction history from local state
 */
export const clearActivities = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Error clearing interaction history:', e);
  }
};
