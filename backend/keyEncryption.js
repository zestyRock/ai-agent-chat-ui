import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits for CBC

/**
 * Generate encryption key from password using PBKDF2
 * @param {string} password - Master password
 * @param {Buffer} salt - Salt for key derivation
 * @returns {Buffer} - Derived key
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256')
}

/**
 * Encrypt OpenRouter API key
 * @param {string} apiKey - The OpenRouter API key to encrypt
 * @param {string} masterPassword - Master password for encryption
 * @returns {string} - Encrypted key data as base64 string
 */
export function encryptApiKey(apiKey, masterPassword) {
  if (!apiKey || !masterPassword) {
    throw new Error('API key and master password are required')
  }

  // Generate random salt and IV
  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(IV_LENGTH)
  
  // Derive encryption key
  const key = deriveKey(masterPassword, salt)
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  // Encrypt the API key
  let encrypted = cipher.update(apiKey, 'utf8')
  encrypted = Buffer.concat([encrypted, cipher.final()])
  
  // Combine salt, iv, and encrypted data
  const combined = Buffer.concat([
    salt,
    iv,
    encrypted
  ])
  
  return combined.toString('base64')
}

/**
 * Decrypt OpenRouter API key
 * @param {string} encryptedData - Encrypted key data as base64 string
 * @param {string} masterPassword - Master password for decryption
 * @returns {string} - Decrypted API key
 */
export function decryptApiKey(encryptedData, masterPassword) {
  if (!encryptedData || !masterPassword) {
    throw new Error('Encrypted data and master password are required')
  }

  try {
    // Decode base64 data
    const combined = Buffer.from(encryptedData, 'base64')
    
    // Extract components
    const salt = combined.subarray(0, 16)
    const iv = combined.subarray(16, 16 + IV_LENGTH)
    const encrypted = combined.subarray(16 + IV_LENGTH)
    
    // Derive decryption key
    const key = deriveKey(masterPassword, salt)
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    
    // Decrypt the API key
    let decrypted = decipher.update(encrypted, null, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    throw new Error('Failed to decrypt API key: Invalid password or corrupted data')
  }
}

/**
 * Generate a random master password
 * @param {number} length - Password length (default: 32)
 * @returns {string} - Random password
 */
export function generateMasterPassword(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstu0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(crypto.randomInt(0, chars.length))
  }
  
  return password
}

/**
 * Validate if encrypted data format is correct
 * @param {string} encryptedData - Encrypted data to validate
 * @returns {boolean} - True if format is valid
 */
export function validateEncryptedData(encryptedData) {
  try {
    const combined = Buffer.from(encryptedData, 'base64')
    return combined.length >= (16 + IV_LENGTH + 1) // Minimum size check
  } catch {
    return false
  }
}