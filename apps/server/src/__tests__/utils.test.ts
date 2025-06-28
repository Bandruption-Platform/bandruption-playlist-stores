import { describe, it, expect } from 'vitest'

function add(a: number, b: number): number {
  return a + b
}

describe('utils', () => {
  it('should add two numbers correctly', () => {
    expect(add(1, 2)).toBe(3)
  })
})