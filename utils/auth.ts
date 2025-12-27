/**
 * Simple password hashing utilities
 * Note: For production, use bcrypt or argon2
 */

/**
 * Hash a password using simple base64 encoding with salt
 * This is for demo purposes - use proper hashing in production
 */
export function hashPassword(password: string): string {
  const salt = 'bachho_security_salt'
  const combined = password + salt + password.split('').reverse().join('')
  return btoa(combined)
}

/**
 * Verify a password against a hashed value
 */
export function verifyPassword(input: string, hashed: string): boolean {
  return hashPassword(input) === hashed
}
