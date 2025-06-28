# 🎵 Bandruption Playlist Stores

A full-stack music platform built with React, React Native, and Node.js in a monorepo architecture.

**Current Status**: This is a development project with mock data and basic implementations. Supabase integration is configured but not fully implemented in the frontend.

## 🚀 Project Structure

This monorepo contains:

- **Web App** (`apps/web`) - React web application with Vite
- **Mobile App** (`apps/mobile`) - React Native app with Expo
- **Server** (`apps/server`) - Node.js API server with Express (basic implementation)
- **Shared Packages**:
  - `packages/shared` - Shared types, utilities, and constants
  - `packages/ui` - Shared UI components (basic Button component)
  - `packages/supabase` - Supabase client and database types

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **React Native** - Cross-platform mobile development (Expo ~49.0.8)
- **TypeScript** - Type safety across the stack
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Web navigation
- **React Navigation** - Mobile navigation
- **Zustand** - Client state management
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework (basic setup)
- **Supabase** - Backend-as-a-Service (configured but using mock data in frontend)
- **PostgreSQL** - Relational database (via Supabase)

### Development
- **Turborepo** - Monorepo build system
- **Vite** - Fast build tool for web
- **Expo** - React Native development platform
- **ESLint** - Code linting
- **TypeScript** - Compilation and type checking

## 📦 Installation

### Prerequisites

- **Node.js 18+** 
- **npm** (comes with Node.js)
- **Expo CLI** (for mobile development): `npm install -g @expo/cli`
- **Supabase CLI** (for database management): `npm install -g supabase`

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bandruption-playlist-stores.git
   cd bandruption-playlist-stores
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   > **Note**: This project uses `legacy-peer-deps=true` in `.npmrc` to handle peer dependency conflicts. This is configured automatically.

3. **Set up environment variables (Optional - currently using mock data)**
   
   The app currently runs with mock data. To use Supabase:
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Set up Supabase (Optional - for full backend functionality)**
   ```bash
   # Start Supabase locally
   npx supabase start
   
   # Generate types
   npm run db:generate
   ```

5. **Start development servers**
   ```bash
   # Start all apps
   npm run dev
   
   # Or start individual apps
   npm run web      # Web app on http://localhost:5173 (Vite default)
   npm run mobile   # Mobile app with Expo
   npm run server   # API server on http://localhost:3001
   ```

## 🏗️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start all apps in development mode
npm run web          # Start web app only
npm run mobile       # Start mobile app only  
npm run server       # Start server only

# Building
npm run build        # Build all apps for production
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint across all packages

# Database (Supabase)
npm run db:generate  # Generate Supabase types
npm run db:push      # Push schema changes to Supabase

# Utilities
npm run clean        # Clean build artifacts
npm run setup        # Install dependencies and generate DB types

# Mobile specific
npm run watchman-clear      # Clear React Native cache
npm run dev:clean          # Clear cache and start dev
npm run mobile:clean       # Clear mobile cache and start
```

## 🏗️ Architecture Overview

### Monorepo Structure

Bandruption Playlist Stores is built as a **Turborepo monorepo** with full-stack TypeScript integration:

```
bandruption-playlist-stores/
├── apps/
│   ├── web/                 # React 19 + Vite + TypeScript + Tailwind CSS
│   ├── mobile/              # React Native + Expo + NativeWind
│   └── server/              # Express + TypeScript API server
├── packages/
│   ├── shared/              # Common types, utilities, constants
│   ├── ui/                  # Cross-platform UI components  
│   └── supabase/            # Database client and generated types
├── package.json             # Root workspace configuration
└── turbo.json              # Build pipeline orchestration
```

### Key Architectural Patterns

#### 1. **Backend-Only Spotify API** (Critical)
- **ALL Spotify Web API calls MUST go through the backend server** (`apps/server`)
- **Frontend apps NEVER call Spotify Web API directly**
- **Exception**: Spotify Web Playback SDK (must run in browser for audio)
- **Security**: Proper authentication, rate limiting, and token management

#### 2. **Shared Package System**
All applications import from internal packages using workspace aliases:
```typescript
import { User, Track } from '@shared/types'
import { Button } from '@shared/ui'  
import { supabase } from '@shared/supabase'
```

#### 3. **Database-First Development**
- Define schema in Supabase Studio
- Generate TypeScript types: `npm run db:generate`
- Types automatically available across all apps

#### 4. **Cross-Platform UI Components**
The `@shared/ui` package exports components that work on both web and mobile through platform-specific implementations.

#### 5. **Turborepo Pipeline**
Build tasks orchestrated through `turbo.json` ensuring dependencies build in correct order:
- Shared packages build first (`^build` dependency)
- Apps can run independently or together
- Intelligent caching optimizes rebuild times

### Application Details

#### **Web App** (`apps/web/`)
- **Stack**: React 19 + Vite + TypeScript + Tailwind CSS
- **Port**: 3000 (development)
- **State**: Zustand + TanStack React Query
- **Features**: Spotify search & playback, playlist management, chat interface

#### **Mobile App** (`apps/mobile/`)  
- **Stack**: React Native + Expo + TypeScript + NativeWind
- **Platforms**: iOS, Android, Web (via Expo)
- **Navigation**: Expo Router with file-based routing
- **Features**: Music library, AI NFT generation, merchandise integration

#### **API Server** (`apps/server/`)
- **Stack**: Express + TypeScript + Node.js  
- **Port**: 3001
- **Security**: Helmet, CORS, JWT authentication
- **Role**: Spotify API proxy, authentication, data management

### Current Implementation Status

#### ✅ Implemented Features
- 🔐 **Mock Authentication** - User registration and login with localStorage
- 🎵 **Playlist Management** - Create, edit, delete playlists (mock data)
- 🎧 **Album Browsing** - View albums and tracks (mock data)
- 📱 **Cross-Platform UI** - Web and mobile interfaces
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 💬 **Chat Interface** - AI chat for music recommendations
- 🎨 **AI Art Studio** - Generate NFTs from album art
- 🛒 **NFT Marketplace** - View and trade generated art

#### 🚧 In Development / TODO
- 🔄 **Real Supabase Integration** - Replace mock data with real backend
- 🔄 **Real-time Data Sync** - Implement with Supabase real-time
- 📊 **Data Persistence** - Move from localStorage to Supabase
- 🧪 **Testing** - Add unit and integration tests
- 🚀 **Production Deployment** - Set up CI/CD pipeline

## 🎵 Spotify Integration

### Integration Architecture

The Spotify integration follows a **backend-proxy pattern** for security and proper API usage:

#### **Critical Design Principle**
- **ALL Spotify Web API calls go through the backend server** (`apps/server`)
- **Frontend applications NEVER call Spotify Web API directly**
- **Single Exception**: Spotify Web Playback SDK (must run in browser for audio playback)

### Authentication Flow

1. **Frontend** calls `/api/spotify/auth/login` to get OAuth URL
2. **User** authorizes application on Spotify
3. **Spotify** redirects to frontend with authorization code
4. **Frontend** sends code to `/api/spotify/auth/callback`
5. **Backend** exchanges code for access/refresh tokens
6. **Backend** stores tokens and returns user identification
7. **Frontend** uses tokens for subsequent API calls

### Features Implemented

#### **Public Features** (No User Authentication)
- **Search**: Music discovery without user login
- **Track/Album/Artist Details**: Metadata access for public content
- **Artist Discography**: Browse artist's albums and tracks

#### **Authenticated Features** (Requires User Login)
- **Spotify Profile Access**: User's Spotify profile information
- **Personalized Search**: Search results in user's context
- **Playback Control**: Control Spotify player (Web Playback SDK)

#### **OAuth Scopes**
The application requests these Spotify permissions:
- `streaming` - Control playback via Web Playback SDK
- `user-read-email` - Access user's email address
- `user-read-private` - Access user's profile information
- `playlist-read-private` - Read user's private playlists
- `playlist-modify-public` - Modify user's public playlists
- `playlist-modify-private` - Modify user's private playlists

### Implementation Details

#### **Backend Service** (`apps/server/src/services/spotifyService.ts`)
- **Library**: `spotify-web-api-node` for API integration
- **Token Management**: Automatic refresh for expired tokens
- **Security**: Environment-based credentials and JWT state verification

#### **Frontend Integration** (`apps/web/src/contexts/SpotifyContext.tsx`)
- **Web Playback SDK**: Direct browser integration for audio streaming
- **React Context**: Centralized state management for Spotify features
- **Player Controls**: Play, pause, skip, volume control

#### **Environment Configuration**
Required environment variables:
```bash
# Spotify API credentials
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# Security
JWT_SECRET=your_jwt_secret
```

### Type Safety

Comprehensive TypeScript definitions in `@shared/types`:
- `SpotifyAuth` - OAuth token management
- `SpotifyUser` - User profile data
- `SpotifyTrack` - Track metadata with album art, preview URLs
- `SpotifyAlbum` - Album details with track listings
- `SpotifyArtist` - Artist information with images and genres
- `SpotifySearchResults` - Unified search response structure

### Security Considerations

1. **Client Credentials Flow**: Public endpoints use server-side client credentials
2. **Authorization Code Flow**: User-specific endpoints use proper OAuth flow
3. **Token Storage**: Secure server-side token management (current: in-memory, production: database)
4. **Rate Limiting**: Server-side rate limiting and error handling
5. **CORS Protection**: Controlled cross-origin access

## 🔌 REST API Documentation

The backend server (`apps/server`) provides a comprehensive REST API for Spotify integration and data management.

### Base URL
- **Development**: `http://localhost:3001`
- **API Prefix**: `/api/spotify`

### Authentication
- **Type**: Bearer token authentication
- **Header**: `Authorization: Bearer <access_token>`

### Public Endpoints (No Authentication)

#### Search
```http
GET /api/spotify/public/search?q=<query>&type=<types>
```
- **Query Parameters**:
  - `q` (required): Search query string
  - `type` (optional): Comma-separated types (default: 'track,album,artist')
- **Response**: `SpotifySearchResults`

#### Track Details
```http
GET /api/spotify/public/track/:id
```
- **Parameters**: `id` - Spotify track ID
- **Response**: `SpotifyTrack`

#### Album Details  
```http
GET /api/spotify/public/album/:id
```
- **Parameters**: `id` - Spotify album ID
- **Response**: `SpotifyAlbum`

#### Artist Details
```http
GET /api/spotify/public/artist/:id
```
- **Parameters**: `id` - Spotify artist ID  
- **Response**: `SpotifyArtist`

#### Artist Albums
```http
GET /api/spotify/public/artist/:id/albums
```
- **Parameters**: `id` - Spotify artist ID
- **Response**: `SpotifyAlbum[]` (limit: 50)

### Authentication Endpoints

#### Login
```http
GET /api/spotify/auth/login
```
- **Response**: `{ authUrl: string }`
- **Purpose**: Generate Spotify OAuth URL

#### Callback
```http
POST /api/spotify/auth/callback
```
- **Body**: `{ code: string, state: string }`
- **Response**: `{ success: boolean, userId: string }`
- **Purpose**: Exchange authorization code for tokens

### User Endpoints

#### Profile
```http
GET /api/spotify/me/:userId
```
- **Parameters**: `userId` - User's Spotify ID
- **Response**: `SpotifyUser`
- **Authentication**: Requires valid tokens

### Authenticated Endpoints

All endpoints require `Authorization: Bearer <token>` header:

#### Authenticated Search
```http
GET /api/spotify/search?q=<query>&type=<types>
```

#### Authenticated Track/Album/Artist
```http
GET /api/spotify/track/:id
GET /api/spotify/album/:id  
GET /api/spotify/artist/:id
GET /api/spotify/artist/:id/albums
```

### Health Check
```http
GET /health
```
- **Response**: `{ status: 'OK', message: 'Server is running!' }`

### Error Responses
All endpoints return consistent error format:
```json
{ "error": "Error message description" }
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not found
- `500` - Internal server error

## 🗄️ Database Schema

The Supabase database schema is defined in `packages/supabase/supabase/seed.sql` with:

- `users` - User profiles and settings (extends Supabase auth.users)
- `playlists` - Playlist metadata and settings
- `tracks` - Individual tracks within playlists

The schema includes proper Row Level Security (RLS) policies for data protection.

## 🚀 Deployment

### Web App
The web app is built with Vite and can be deployed to Vercel, Netlify, or any static hosting service:

```bash
npm run build
# Deploy the apps/web/dist folder
```

### Mobile App
The mobile app can be built and deployed using Expo:

```bash
cd apps/mobile
npx expo build:android  # Android APK
npx expo build:ios      # iOS IPA (requires Apple Developer account)
```

### Server
The server can be deployed to Railway, Render, or any Node.js hosting service:

```bash
npm run build
# Deploy the apps/server/dist folder with package.json
```

## 🧩 Development Notes

- **Current State**: The app runs primarily on mock data for demonstration purposes
- **Authentication**: Uses localStorage-based mock authentication
- **Data Flow**: Currently using React Context for state management
- **Styling**: Tailwind CSS with responsive design
- **Icons**: Lucide React for consistent iconography

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Turborepo](https://turbo.build) for the monorepo tooling
- [Expo](https://expo.dev) for React Native development
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Vite](https://vitejs.dev) for fast web development
- [Lucide](https://lucide.dev) for beautiful icons

---

Built with ❤️ by the Bandruption team 