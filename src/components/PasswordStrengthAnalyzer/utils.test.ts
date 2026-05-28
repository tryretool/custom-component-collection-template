import { describe, it, expect } from 'vitest'
import { calculateStrength } from './utils'

describe('calculateStrength', () => {
    it('returns 0 for empty password', () => {
        expect(calculateStrength('')).toBe(0)
    })

    it('calculates strength correctly', () => {
        expect(calculateStrength('password')).toBe(0) // width < 8 no spec chars
        expect(calculateStrength('longpassword')).toBe(1) // length > 8
        expect(calculateStrength('Longpassword')).toBe(2) // length > 8 + uppercase
        expect(calculateStrength('Longpassword1')).toBe(3) // length > 8 + uppercase + number
        expect(calculateStrength('Longpassword1!')).toBe(4) // length > 8 + uppercase + number + special char
    })
})
