// Haptic Feedback Helper utility using Navigator.vibrate API for mobile touch feedback

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'reaction' | 'selection';

export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      switch (pattern) {
        case 'light':
        case 'selection':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(22);
          break;
        case 'heavy':
          navigator.vibrate(40);
          break;
        case 'success':
          navigator.vibrate([15, 30, 25]);
          break;
        case 'reaction':
          navigator.vibrate([12, 18, 30]);
          break;
        default:
          navigator.vibrate(15);
      }
    } catch {
      // Ignore vibration errors if blocked by system/user settings
    }
  }
}
