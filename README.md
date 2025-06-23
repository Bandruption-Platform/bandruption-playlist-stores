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
- **React 18** - Modern React with hooks
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

### Project Architecture

```
bandruption-playlist-stores/
├── apps/
│   ├── web/                 # React web app (Vite + React 18)
│   ├── mobile/              # React Native mobile app (Expo)
│   └── server/              # Node.js API server (Express - basic)
├── packages/
│   ├── shared/              # Shared types and utils
│   ├── ui/                  # Shared UI components
│   └── supabase/            # Database client and types
└── turbo.json              # Turborepo configuration
```

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
- 🎵 **Spotify Integration** - Connect to Spotify API
- 🔄 **Real-time Data Sync** - Implement with Supabase real-time
- 📊 **Data Persistence** - Move from localStorage to Supabase
- 🧪 **Testing** - Add unit and integration tests
- 🚀 **Production Deployment** - Set up CI/CD pipeline

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