## 🎯 **Recommended Testing Stack**

### **For Web App & Server (Vitest)**
**Vitest** is the clear winner for your modern Vite-based stack in 2025:

- **3-5x faster** than Jest for Vite projects
- Native ES module support (perfect for your modern setup)
- Jest-compatible API (easy migration path)
- Better TypeScript integration out-of-the-box
- Excellent developer experience with hot reloading

### **For Mobile App (Jest + React Native Testing Library)**
**Jest** remains the standard for React Native/Expo:

- Official Expo support and documentation
- Mature ecosystem for React Native testing
- Well-established patterns and community support

### **For E2E Testing**
- **Detox** for React Native E2E testing
- **Playwright** for web E2E (optional, but recommended for critical user flows)

## 🚀 **Implementation Plan**

### **Step 1: Install Dependencies**

```bash
# Root dependencies for Vitest workspace
npm install -D vitest @vitest/ui vite-tsconfig-paths

# Web app testing
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom --workspace=apps/web

# Server testing  
npm install -D supertest @types/supertest --workspace=apps/server

# Mobile testing (Jest is already included with Expo)
npm install -D @testing-library/react-native jest-expo --workspace=apps/mobile

# Shared packages testing
npm install -D @testing-library/react @testing-library/jest-dom --workspace=packages/ui
```

### **Step 2: Configure Vitest Workspace**

Create `vitest.workspace.ts` in your root:

```typescript
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'apps/web',
  'apps/server', 
  'packages/*'
])
```

### **Step 3: Package-Specific Configurations**

**Web app (`apps/web/vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/test/**']
    }
  }
})
```

**Server (`apps/server/vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

**Mobile (`apps/mobile/jest.config.js`):**
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/expo-env.d.ts',
    '!**/.expo/**'
  ]
}
```

### **Step 4: Update Turbo Configuration**

Update your `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "test:ui": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### **Step 5: Update Package Scripts**

**Root `package.json`:**
```json
{
  "scripts": {
    "test": "turbo run test",
    "test:watch": "turbo run test:watch",
    "test:ui": "vitest --ui",
    "test:mobile": "turbo run test --filter=mobile"
  }
}
```

**Individual package scripts:**
- Web/Server: `"test": "vitest run"`, `"test:watch": "vitest"`  
- Mobile: `"test": "jest"`, `"test:watch": "jest --watch"`

## 📊 **Why This Stack Works for 2025**

### **Performance Benefits**
- Vitest runs **10-20x faster** than Jest in watch mode
- Native TypeScript support (no ts-jest needed)
- Hot module reloading for tests
- Better caching with Vite integration

### **Developer Experience**
- Jest-compatible API (easy team adoption)
- Modern test UI with `@vitest/ui`
- Better error messages and stack traces
- Consistent with your Vite development environment

### **Monorepo Advantages**
- Turborepo caching works perfectly with both Jest and Vitest
- Shared test utilities across packages
- Unified coverage reporting
- Parallel test execution

## 🛠 **Next Steps**

1. **Start with web app testing** (easiest migration)
2. **Add server API testing** using Vitest + Supertest
3. **Implement mobile testing** with Jest + React Native Testing Library
4. **Consider E2E testing** with Detox for mobile and Playwright for web
5. **Set up CI/CD integration** with test caching

This setup gives you the best of both worlds: modern, fast testing for your Vite-based projects while maintaining the stability and ecosystem support of Jest for React Native. The configuration is designed to scale with your monorepo and take advantage of 2025's best practices.