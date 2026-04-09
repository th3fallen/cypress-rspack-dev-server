import { describe, it, expect } from 'vitest'

import { normalizeError } from '../src/CypressCTRspackPlugin'

describe('normalizeError', () => {
  it('returns the string as-is when given a string', () => {
    expect(normalizeError('something went wrong')).toBe('something went wrong')
  })

  it('returns the message property when given an Error', () => {
    expect(normalizeError(new Error('test error'))).toBe('test error')
  })

  it('handles empty string', () => {
    expect(normalizeError('')).toBe('')
  })

  it('handles Error with empty message', () => {
    expect(normalizeError(new Error(''))).toBe('')
  })
})
