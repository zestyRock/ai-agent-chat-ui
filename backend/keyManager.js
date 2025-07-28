#!/usr/bin/env node

import { encryptApiKey, decryptApiKey, generateMasterPassword, validateEncryptedData } from './keyEncryption.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ENCRYPTED_KEY_FILE = path.join(__dirname, '.encrypted_keys.json')

/**
 * Save encrypted key to file
 * @param {string} keyName - Name of the key
 * @param {string} encryptedData - Encrypted key data
 */
function saveEncryptedKey(keyName, encryptedData) {
  let keys = {}
  
  if (fs.existsSync(ENCRYPTED_KEY_FILE)) {
    try {
      const content = fs.readFileSync(ENCRYPTED_KEY_FILE, 'utf8')
      keys = JSON.parse(content)
    } catch (error) {
      console.warn('Warning: Could not read existing encrypted keys file')
    }
  }
  
  keys[keyName] = {
    data: encryptedData,
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  }
  
  fs.writeFileSync(ENCRYPTED_KEY_FILE, JSON.stringify(keys, null, 2))
  console.log(`Encrypted key '${keyName}' saved successfully`)
}

/**
 * Load encrypted key from file
 * @param {string} keyName - Name of the key
 * @returns {string|null} - Encrypted key data or null if not found
 */
function loadEncryptedKey(keyName) {
  if (!fs.existsSync(ENCRYPTED_KEY_FILE)) {
    return null
  }
  
  try {
    const content = fs.readFileSync(ENCRYPTED_KEY_FILE, 'utf8')
    const keys = JSON.parse(content)
    return keys[keyName]?.data || null
  } catch (error) {
    console.error('Error reading encrypted keys file:', error.message)
    return null
  }
}

/**
 * CLI interface
 */
function showHelp() {
  console.log(`
Key Manager - Encrypt and manage API keys

Usage:
  node keyManager.js encrypt <key-name> <api-key> [master-password]
  node keyManager.js decrypt <key-name> <master-password>
  node keyManager.js generate-password [length]
  node keyManager.js list
  node keyManager.js validate <key-name>

Examples:
  node keyManager.js encrypt openrouter "sk-or-v1-abc123..." mypassword
  node keyManager.js decrypt openrouter mypassword
  node keyManager.js generate-password 32
  node keyManager.js list
  node keyManager.js validate openrouter

Options:
  encrypt      Encrypt an API key with a master password
  decrypt      Decrypt an API key with the master password
  generate-password  Generate a secure random master password
  list         List all stored encrypted keys
  validate     Validate encrypted key format
`)
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    showHelp()
    return
  }
  
  const command = args[0]
  
  try {
    switch (command) {
      case 'encrypt': {
        const [, keyName, apiKey, masterPassword] = args
        
        if (!keyName || !apiKey) {
          console.error('Error: Key name and API key are required')
          console.log('Usage: node keyManager.js encrypt <key-name> <api-key> [master-password]')
          process.exit(1)
        }
        
        const password = masterPassword || generateMasterPassword()
        if (!masterPassword) {
          console.log(`Generated master password: ${password}`)
          console.log('IMPORTANT: Save this password securely - you will need it to decrypt the key!')
        }
        
        const encrypted = encryptApiKey(apiKey, password)
        saveEncryptedKey(keyName, encrypted)
        break
      }
      
      case 'decrypt': {
        const [, keyName, masterPassword] = args
        
        if (!keyName || !masterPassword) {
          console.error('Error: Key name and master password are required')
          console.log('Usage: node keyManager.js decrypt <key-name> <master-password>')
          process.exit(1)
        }
        
        const encryptedData = loadEncryptedKey(keyName)
        if (!encryptedData) {
          console.error(`Error: No encrypted key found for '${keyName}'`)
          process.exit(1)
        }
        
        const decrypted = decryptApiKey(encryptedData, masterPassword)
        console.log(`Decrypted key for '${keyName}': ${decrypted}`)
        break
      }
      
      case 'generate-password': {
        const length = parseInt(args[1]) || 32
        const password = generateMasterPassword(length)
        console.log(`Generated password: ${password}`)
        break
      }
      
      case 'list': {
        if (!fs.existsSync(ENCRYPTED_KEY_FILE)) {
          console.log('No encrypted keys found')
          return
        }
        
        const content = fs.readFileSync(ENCRYPTED_KEY_FILE, 'utf8')
        const keys = JSON.parse(content)
        
        console.log('Stored encrypted keys:')
        Object.entries(keys).forEach(([name, info]) => {
          console.log(`  - ${name} (created: ${info.created}, updated: ${info.updated})`)
        })
        break
      }
      
      case 'validate': {
        const [, keyName] = args
        
        if (!keyName) {
          console.error('Error: Key name is required')
          console.log('Usage: node keyManager.js validate <key-name>')
          process.exit(1)
        }
        
        const encryptedData = loadEncryptedKey(keyName)
        if (!encryptedData) {
          console.error(`Error: No encrypted key found for '${keyName}'`)
          process.exit(1)
        }
        
        const isValid = validateEncryptedData(encryptedData)
        console.log(`Key '${keyName}' format is ${isValid ? 'valid' : 'invalid'}`)
        break
      }
      
      default:
        console.error(`Unknown command: ${command}`)
        showHelp()
        process.exit(1)
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()