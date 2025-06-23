export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  PLAYLISTS: {
    BASE: '/playlists',
    BY_ID: (id: string) => `/playlists/${id}`,
    TRACKS: (id: string) => `/playlists/${id}/tracks`,
  },
  TRACKS: {
    BASE: '/tracks',
    BY_ID: (id: string) => `/tracks/${id}`,
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
} as const;

export const QUERY_KEYS = {
  PLAYLISTS: 'playlists',
  PLAYLIST: 'playlist',
  TRACKS: 'tracks',
  USER: 'user',
  AUTH: 'auth',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'bandruption_access_token',
  REFRESH_TOKEN: 'bandruption_refresh_token',
  USER: 'bandruption_user',
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PLAYLIST_TITLE_LENGTH: 100,
  MAX_PLAYLIST_DESCRIPTION_LENGTH: 500,
  MAX_USERNAME_LENGTH: 30,
} as const; 