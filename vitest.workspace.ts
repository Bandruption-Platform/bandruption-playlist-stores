import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'apps/web',
  'apps/server', 
  'packages/*'
])