// Google Drive & Google Calendar API Integration Services for the user's personal Google Account
import { GoogleUserProfile, TestSessionResult, TestSettings, CalendarEventRequest } from '../types';

const DRIVE_FILE_NAME = 'jee_neet_mcq_timer_backup.json';

export interface BackupPayload {
  version: number;
  updatedAt: string;
  userEmail: string;
  settings: TestSettings | null;
  sessions: TestSessionResult[];
}

/**
 * Initiates Google OAuth Token Client popup for user authentication
 */
export async function authenticateGoogleUser(clientId: string): Promise<GoogleUserProfile> {
  return new Promise((resolve, reject) => {
    // Check if Google GSI library is loaded
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      // Fallback if GSI script hasn't loaded: request token via standard OAuth URL or demo mode
      reject(
        new Error(
          'Google Accounts Identity library is initializing. Please try again or provide a Client ID in settings.'
        )
      );
      return;
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope:
          'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar.events',
        callback: async (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }

          const accessToken = response.access_token;
          const expiresIn = response.expires_in || 3600;

          // Fetch User Profile from Google userInfo API
          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!userInfoRes.ok) throw new Error('Failed to fetch Google profile information');
            const info = await userInfoRes.json();

            resolve({
              id: info.sub,
              name: info.name || info.email.split('@')[0],
              email: info.email,
              picture: info.picture,
              accessToken,
              tokenExpiresAt: Date.now() + expiresIn * 1000,
            });
          } catch (err: any) {
            reject(err);
          }
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      reject(err);
    }
  });
}

/**
 * Searches for existing backup file in user's personal Google Drive
 */
async function findDriveBackupFile(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Google authentication session expired. Please sign in again.');
    }
    const errObj = await response.json().catch(() => ({}));
    const errorMsg = errObj?.error?.message || response.statusText || `HTTP ${response.status}`;
    if (response.status === 403) {
      throw new Error(
        `Google Drive API Permission Error (403): ${errorMsg}. Please ensure Google Drive API is enabled in your Google Cloud Console for this Client ID.`
      );
    }
    throw new Error(`Google Drive API search error: ${errorMsg}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

/**
 * Save user config, settings, and test history to the user's personal Google Drive
 */
export async function saveToGoogleDrive(
  accessToken: string,
  payload: BackupPayload
): Promise<string> {
  const fileContent = JSON.stringify(payload, null, 2);
  let existingFileId: string | null = null;

  try {
    existingFileId = await findDriveBackupFile(accessToken);
  } catch (err: any) {
    console.warn('Drive search warning, proceeding to create file:', err);
    if (err.message?.includes('expired') || err.message?.includes('401')) {
      throw err;
    }
  }

  const metadata = {
    name: DRIVE_FILE_NAME,
    mimeType: 'application/json',
    description: 'Backup data for JEE NEET MCQ Speed Analytics App',
  };

  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', new Blob([fileContent], { type: 'application/json' }));

  if (existingFileId) {
    // Update existing file
    const uploadRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      }
    );
    if (!uploadRes.ok) {
      const errObj = await uploadRes.json().catch(() => ({}));
      const msg = errObj?.error?.message || uploadRes.statusText;
      throw new Error(`Failed to update Google Drive backup: ${msg}`);
    }
    return existingFileId;
  } else {
    // Create new file
    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      }
    );
    if (!uploadRes.ok) {
      const errObj = await uploadRes.json().catch(() => ({}));
      const msg = errObj?.error?.message || uploadRes.statusText;
      throw new Error(`Failed to create Google Drive backup: ${msg}`);
    }
    const result = await uploadRes.json();
    return result.id;
  }
}

/**
 * Restore user config, settings, and test history from the user's personal Google Drive
 */
export async function loadFromGoogleDrive(accessToken: string): Promise<BackupPayload | null> {
  let existingFileId: string | null = null;
  try {
    existingFileId = await findDriveBackupFile(accessToken);
  } catch (err: any) {
    if (err.message?.includes('expired') || err.message?.includes('401')) {
      throw err;
    }
    console.warn('Drive load search failed:', err);
    return null;
  }

  if (!existingFileId) {
    return null; // No previous backup found
  }

  const downloadRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${existingFileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!downloadRes.ok) {
    const errObj = await downloadRes.json().catch(() => ({}));
    const msg = errObj?.error?.message || downloadRes.statusText;
    throw new Error(`Failed to download backup from Google Drive: ${msg}`);
  }

  const backupData: BackupPayload = await downloadRes.json();
  return backupData;
}

/**
 * Schedule Practice Session / Exam Reminder in the user's personal Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  eventData: CalendarEventRequest
): Promise<{ id: string; htmlLink: string }> {
  const event = {
    summary: eventData.title,
    description: eventData.description,
    start: {
      dateTime: eventData.startIso,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: eventData.endIso,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: eventData.reminderMinutes || 15 },
        ...(eventData.emailReminderMinutes
          ? [{ method: 'email', minutes: eventData.emailReminderMinutes }]
          : [{ method: 'email', minutes: 30 }]),
      ],
    },
    colorId: '6', // Tangerine / Amber color in Google Calendar
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Google Calendar access token expired. Please re-authenticate.');
    }
    const errObj = await response.json().catch(() => ({}));
    throw new Error(errObj?.error?.message || `Google Calendar API error: ${response.statusText}`);
  }

  const created = await response.json();
  return {
    id: created.id,
    htmlLink: created.htmlLink,
  };
}
