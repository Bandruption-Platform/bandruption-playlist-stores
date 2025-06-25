const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Expo Metro config
const config = getDefaultConfig(__dirname);

// Add the monorepo root to watchFolders
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

config.watchFolders = [monorepoRoot];

// Add shared packages to resolver
config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// Force Metro to resolve from monorepo root first
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Always resolve React from monorepo root
  if (moduleName === 'react' || moduleName === 'react/jsx-runtime' || moduleName === 'react/jsx-dev-runtime') {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName, { paths: [monorepoRoot] }),
    };
  }
  
  if (moduleName === 'react-dom') {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName, { paths: [monorepoRoot] }),
    };
  }
  
  // Use default resolution for other modules
  return context.resolveRequest(context, moduleName, platform);
};

// Add shared packages mapping
config.resolver.extraNodeModules = {
  '@shared/types': path.resolve(monorepoRoot, 'packages/shared'),
  '@shared/ui': path.resolve(monorepoRoot, 'packages/ui'),
  '@shared/supabase': path.resolve(monorepoRoot, 'packages/supabase'),
};

// Configure Watchman (optional but recommended)
config.watcher = {
  ...config.watcher,
  watchman: {
    deferStates: ['hg.update', 'git.update'],
  },
};

module.exports = config;
