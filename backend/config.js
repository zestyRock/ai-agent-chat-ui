import { decryptApiKey } from './keyEncryption.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ENCRYPTED_KEY_FILE = path.join(__dirname, '.encrypted_keys.json')

/**
 * Load and decrypt API key
 * @param {string} keyName - Name of the key to load
 * @param {string} masterPassword - Master password for decryption
 * @returns {string|null} - Decrypted API key or null if not found
 */
export function loadApiKey(keyName, masterPassword) {
  if (!fs.existsSync(ENCRYPTED_KEY_FILE)) {
    throw new Error(`Encrypted keys file not found. Please encrypt your keys first using keyManager.js`)
  }
  
  try {
    const content = fs.readFileSync(ENCRYPTED_KEY_FILE, 'utf8')
    const keys = JSON.parse(content)
    
    if (!keys[keyName]) {
      throw new Error(`No encrypted key found for '${keyName}'`)
    }
    
    const encryptedData = keys[keyName].data
    return decryptApiKey(encryptedData, masterPassword)
  } catch (error) {
    if (error.message.includes('Failed to decrypt')) {
      throw new Error(`Failed to decrypt '${keyName}': Check your master password`)
    }
    throw error
  }
}

/**
 * Configuration object with encrypted key support
 */
export const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/intent',
  
  // Master password for key decryption
  // This should be provided via environment variable for security
  masterPassword: process.env.MASTER_PASSWORD,
  
  /**
   * Get OpenRouter API key (decrypted)
   * @returns {string} - Decrypted OpenRouter API key
   */
  getOpenRouterKey() {
    if (!this.masterPassword) {
      throw new Error('MASTER_PASSWORD environment variable is required to decrypt API keys')
    }
    
    return loadApiKey('openrouter', this.masterPassword)
  },
  
  /**
   * Check if encrypted keys are available
   * @returns {boolean} - True if encrypted keys file exists
   */
  hasEncryptedKeys() {
    return fs.existsSync(ENCRYPTED_KEY_FILE)
  },
  
  /**
   * List available encrypted keys
   * @returns {string[]} - Array of key names
   */
  listEncryptedKeys() {
    if (!this.hasEncryptedKeys()) {
      return []
    }
    
    try {
      const content = fs.readFileSync(ENCRYPTED_KEY_FILE, 'utf8')
      const keys = JSON.parse(content)
      return Object.keys(keys)
    } catch (error) {
      console.error('Error reading encrypted keys:', error.message)
      return []
    }
  }
}

export default config