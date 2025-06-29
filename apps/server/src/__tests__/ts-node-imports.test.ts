import { describe, it, expect } from 'vitest'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('ts-node import validation', () => {
  it('should be able to run index.ts with ts-node without import errors', async () => {
    const serverPath = join(__dirname, '..', 'index.ts')
    
    const promise = new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve) => {
      const child = spawn('node', ['--loader', 'ts-node/esm', serverPath], {
        env: { ...process.env, PORT: '0' }, // Use port 0 to avoid conflicts
        stdio: 'pipe'
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      // Kill the process after 3 seconds if it starts successfully
      const timeout = setTimeout(() => {
        child.kill('SIGTERM')
        resolve({ stdout, stderr, exitCode: 0 }) // Success if it runs this long
      }, 3000)

      child.on('exit', (code) => {
        clearTimeout(timeout)
        resolve({ stdout, stderr, exitCode: code || 0 })
      })
    })

    const result = await promise

    // If there are import errors, they'll show up in stderr and cause early exit
    expect(result.stderr).not.toContain('Cannot find module')
    expect(result.stderr).not.toContain('ERR_MODULE_NOT_FOUND')
    
    // Should either exit cleanly (code 0) or be killed by timeout (also success)
    if (result.exitCode !== 0) {
      console.log('STDOUT:', result.stdout)
      console.log('STDERR:', result.stderr)
    }
    expect(result.exitCode).toBe(0)
  }, 10000) // 10 second timeout for the test
})