import { SpotifyUser } from '@shared/types';

export interface PopupAuthResult {
  success: boolean;
  userId?: string;
  accessToken?: string;
  userData?: SpotifyUser;
  error?: string;
}

class PopupAuthService {
  private currentPopup: Window | null = null;

  async loginWithPopup(): Promise<PopupAuthResult> {
    return new Promise((resolve, reject) => {
      this.openAuthPopup()
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  }

  private async openAuthPopup(): Promise<PopupAuthResult> {
    try {
      // Get auth URL from backend
      const response = await fetch('http://localhost:3001/api/spotify/auth/login');
      const { authUrl } = await response.json();

      // Open popup window
      const popup = window.open(
        authUrl,
        'spotify-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      this.currentPopup = popup;

      // Listen for messages from popup
      return new Promise((resolve, reject) => {
        const messageListener = (event: MessageEvent) => {
          // Security: Only accept messages from our domain
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'spotify-auth-success') {
            window.removeEventListener('message', messageListener);
            popup.close();
            this.currentPopup = null;
            resolve({
              success: true,
              userId: event.data.userId,
              accessToken: event.data.accessToken,
              userData: event.data.userData
            });
          }

          if (event.data.type === 'spotify-auth-error') {
            window.removeEventListener('message', messageListener);
            popup.close();
            this.currentPopup = null;
            resolve({
              success: false,
              error: event.data.error
            });
          }
        };

        // Listen for popup messages
        window.addEventListener('message', messageListener);

        // Handle popup being closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            this.currentPopup = null;
            resolve({
              success: false,
              error: 'Authentication cancelled'
            });
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
            this.currentPopup = null;
          }
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('Authentication timeout'));
        }, 5 * 60 * 1000);
      });

    } catch (error) {
      throw new Error(`Failed to start authentication: ${error}`);
    }
  }

  closeCurrentPopup() {
    if (this.currentPopup && !this.currentPopup.closed) {
      this.currentPopup.close();
      this.currentPopup = null;
    }
  }
}

export const popupAuthService = new PopupAuthService();