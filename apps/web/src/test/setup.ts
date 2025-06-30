import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock scrollIntoView which isn't available in test environment
Element.prototype.scrollIntoView = vi.fn()