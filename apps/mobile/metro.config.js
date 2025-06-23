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

// Configure Watchman (optional but recommended)
config.watcher = {
  ...config.watcher,
  watchman: {
    deferStates: ['hg.update', 'git.update'],
  },
};

module.exports = config;
