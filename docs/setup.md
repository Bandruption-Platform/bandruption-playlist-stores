# Setup Guide

This guide will help you set up the Bandruption Playlist Stores monorepo for development.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Git**
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Expo CLI** (for mobile development): `npm install -g @expo/cli`
- **Supabase CLI** (for database management): `npm install -g supabase`

## Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bandruption-playlist-stores
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your configuration:
   - Supabase URL and API keys
   - JWT secrets
   - Any other environment-specific variables

## Supabase Setup

### Option 1: Local Development (Recommended)

1. **Initialize Supabase locally**
   ```bash
   cd packages/supabase
   supabase init
   ```

2. **Start Supabase services**
   ```bash
   supabase start
   ```
   This will start PostgreSQL, Auth, API, and Studio locally.

3. **Run migrations**
   ```bash
   supabase db reset
   ```

4. **Generate TypeScript types**
   ```bash
   npm run db:generate
   ```

### Option 2: Supabase Cloud

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update your `.env` file with these values
4. Run the SQL from `packages/supabase/supabase/seed.sql` in the Supabase SQL editor

## Development

1. **Start all development servers**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Web app at http://localhost:3000
   - Mobile app with Expo
   - API server at http://localhost:3001

2. **Or start individual apps**
   ```bash
   npm run web      # Web app only
   npm run mobile   # Mobile app only
   npm run server   # API server only
   ```

## Mobile Development

1. **Install Expo CLI** (if not already installed)
   ```bash
   npm install -g @expo/cli
   ```

2. **Start the mobile app**
   ```bash
   npm run mobile
   ```

3. **Test on device/simulator**
   - Install Expo Go on your mobile device
   - Scan the QR code shown in the terminal
   - Or use iOS Simulator / Android Emulator

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Make sure ports 3000, 3001, and Supabase ports (54321-54328) are available
   - You can change ports in the respective config files

2. **Dependency issues**
   ```bash
   # Clear all node_modules and reinstall
   npm run clean
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript errors**
   ```bash
   # Regenerate types and check for errors
   npm run type-check
   npm run db:generate
   ```

4. **Database connection issues**
   - Check if Supabase is running: `supabase status`
   - Verify environment variables are correct
   - Check database logs: `supabase logs -f`

5. **Starting with NPX**
   ```bash
   nvm use xx.xx
   cd apps/mobile
   npx expo start --clear
   ```

### Getting Help

- Check the main [README.md](../README.md) for more information
- Review the [development guide](./development.md)
- Open an issue in the repository if you encounter problems

## Next Steps

After setup is complete:

1. Explore the codebase structure
2. Read the [development guide](./development.md)
3. Check out the [deployment guide](./deployment.md)
4. Start building features! 