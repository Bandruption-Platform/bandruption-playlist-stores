# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bandruption Playlist Stores is a full-stack music platform built as a Turborepo monorepo. It consists of:
- Web app (React + Vite + TypeScript + Tailwind)
- Mobile app (React Native + Expo + NativeWind)
- API server (Express + TypeScript)
- Shared packages for types, UI components, and Supabase integration

## Essential Commands

### Development
```bash
npm run dev          # Start all apps in development mode
npm run web          # Start only web app
npm run mobile       # Start only mobile app
npm run server       # Start only API server
```

### Build & Quality
```bash
npm run build        # Build all apps for production
npm run lint         # Lint all packages
npm run type-check   # TypeScript type checking across all packages
npm run test         # Run tests (when implemented)
npm run clean        # Clean build artifacts
```

### Database
```bash
npm run db:generate  # Generate TypeScript types from Supabase schema
npm run db:push      # Push database schema changes to Supabase
```

## Architecture Overview

### Monorepo Structure
- **apps/**: Contains web, mobile, and server applications
- **packages/**: Shared code across applications
  - `shared`: Common types, utilities, and constants
  - `ui`: Cross-platform UI components
  - `supabase`: Database client and generated types

### Key Architectural Patterns

1. **Shared Package Pattern**: All apps import from internal packages using workspace aliases:
   ```typescript
   import { Button } from '@shared/ui'
   import { User } from '@shared/types'
   import { supabase } from '@shared/supabase'
   ```

2. **Database-First Development**: 
   - Define schema in Supabase
   - Generate TypeScript types with `npm run db:generate`
   - Types are automatically available in all apps

3. **Cross-Platform UI Components**: The `@shared/ui` package exports components that work on both web and mobile through platform-specific implementations.

4. **Turborepo Pipeline**: Build tasks are orchestrated through `turbo.json`, ensuring dependencies are built in the correct order.

5. **Spotify API Architecture** (CRITICAL):
   - **ALL Spotify API calls MUST go through the backend server** (`apps/server`)
   - **Frontend apps (web/mobile) MUST NEVER call Spotify Web API directly**
   - The ONLY exception is the Spotify Web Playback SDK which must run in the browser
   - Backend server handles:
     - Spotify authentication & token management
     - All search, track, album, artist, and playlist operations
     - Rate limiting and error handling
   - Frontend communicates with backend via `/api/spotify/*` endpoints
   - This architecture ensures proper authentication, security, and API usage

## Development Workflow

1. **Adding New Features**:
   - Define types in `packages/shared/src/types`
   - Create/update UI components in `packages/ui`
   - Implement API endpoints in `apps/server`
   - Build frontend features in `apps/web` or `apps/mobile`

2. **Database Changes**:
   - Modify schema in Supabase Studio or via migrations
   - Run `npm run db:generate` to update TypeScript types
   - Types are immediately available across all packages

3. **Running Specific Tasks**:
   - Use `turbo run <task> --filter=<package>` for targeted execution
   - Example: `turbo run dev --filter=web` to run only web app

## Important Configuration

- **Environment Variables**: Copy `.env.example` to `.env` and configure Supabase credentials
- **Ports**: 
  - Web: 3000
  - API: 3001
  - Supabase Studio: 54323
- **TypeScript**: Each package has its own `tsconfig.json` extending shared configuration
- **ESLint**: Configured at root level with TypeScript support