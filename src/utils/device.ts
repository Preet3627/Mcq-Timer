// Native Browser & PWA Integration Utilities (Wake Lock, Haptics, Notifications, Web Share)

let wakeLockSentinel: WakeLockSentinel | null = null;

/**
 * Request Screen Wake Lock to prevent mobile phone display from sleeping during MCQ timer
 */
export async function requestWakeLock(): Promise<boolean> {
  if ('wakeLock' in navigator) {
    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('Screen Wake Lock request failed:', err);
      return false;
    }
  }
  return false;
}

export const requestScreenWakeLock = requestWakeLock;

/**
 * Release Screen Wake Lock when session ends or user navigates away
 */
export async function releaseWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch (err) {
      console.warn('Screen Wake Lock release failed:', err);
    } stroke: null; {
      wakeLockSentinel = null;
    }
  }
}

export const releaseScreenWakeLock = releaseWakeLock;

/**
 * Haptic Vibration Feedback for Mobile / Android devices
 */
export function vibrateDevice(pattern: number | number[] = 50): void {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Haptics not supported or blocked by user gesture policy
    }
  }
}

/**
 * Request System Notification Permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  }
  return false;
}

/**
 * Send System Native Notification for Pace Alarms / Session Complete
 */
export function sendSystemNotification(title: string, body: string, icon = '/icon-192.png'): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
    } catch (e) {
      console.warn('Failed to send notification:', e);
    }
  }
}

/**
 * Web Share API to share scorecard results with friends / apps
 */
export async function shareScorecard(data: {
  title: string;
  text: string;
  url?: string;
}): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url || window.location.href,
      });
      return true;
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.warn('Web Share failed:', e);
      }
    }
  } else if (navigator.clipboard) {
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(`${data.title}\n\n${data.text}`);
      return true;
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  }
  return false;
}

export const shareContent = shareScorecard;
