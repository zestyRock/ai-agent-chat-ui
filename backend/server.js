import express from 'express'
import cors from 'cors'
import axios from 'axios'
import config, { loadApiKey } from './config.js'

const app = express()
const PORT = config.port

app.use(cors())
app.use(express.json())

const N8N_WEBHOOK_URL = config.n8nWebhookUrl

app.post('/api/chat', async (req, res) => {
  try {
    const { message, testMode } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Choose webhook URL based on test mode
    const webhookUrl = testMode 
      ? 'http://localhost:5678/webhook-test/intent'
      : N8N_WEBHOOK_URL

    console.log('Received message:', message)
    console.log('Test mode:', testMode)
    console.log('Forwarding to n8n webhook:', webhookUrl)

    const response = await axios.post(webhookUrl, {
      message: message,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })

    console.log('n8n response:', response.data)
    console.log('Response data type:', typeof response.data)
    console.log('Response data keys:', Object.keys(response.data || {}))

    let structuredData = null
    let responseMessage = 'Message processed successfully'

    // Handle n8n response format
    if (response.data && response.data.text) {
      try {
        // Parse the JSON string from n8n
        structuredData = JSON.parse(response.data.text)
        responseMessage = `Intent parsed successfully. Found transportation request from ${structuredData.origin || 'unknown'} to ${structuredData.destination || 'unknown'}.`
      } catch (error) {
        console.error('Error parsing n8n JSON response:', error)
        responseMessage = 'Received response but could not parse structured data'
      }
    } else if (response.data && response.data.structuredData) {
      // Fallback for other response formats
      structuredData = response.data.structuredData
      responseMessage = response.data.response || responseMessage
    } else if (response.data && (response.data.hasOwnProperty('mode') || response.data.origin || response.data.destination)) {
      // Handle direct JSON object from n8n
      structuredData = response.data
      responseMessage = `Intent parsed successfully. Found transportation request from ${structuredData.origin || 'unknown'} to ${structuredData.destination || 'unknown'}.`
      console.log('Using direct JSON format, structuredData:', structuredData)
      console.log('Structured data will be sent to frontend:', JSON.stringify(structuredData, null, 2))
    } else {
      console.log('No matching format found for response.data:', response.data)
    }

    res.json({
      success: true,
      response: responseMessage,
      structuredData: structuredData
    })

  } catch (error) {
    console.error('Error processing message:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'n8n service unavailable',
        message: 'Could not connect to n8n webhook. Please ensure n8n is running.'
      })
    } else if (error.code === 'ENOTFOUND') {
      res.status(503).json({
        error: 'n8n webhook not found',
        message: 'Invalid n8n webhook URL. Please check the configuration.'
      })
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'An error occurred while processing your message'
      })
    }
  }
})

app.get('/api/health', (req, res) => {
  const encryptedKeys = config.listEncryptedKeys()
  const hasEncryptedKeys = config.hasEncryptedKeys()
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    n8nWebhookUrl: N8N_WEBHOOK_URL,
    encryption: {
      enabled: hasEncryptedKeys,
      keysAvailable: encryptedKeys,
      masterPasswordProvided: !!config.masterPassword
    }
  })
})

// Endpoint to get encrypted key status
app.get('/api/keys/status', (req, res) => {
  try {
    const encryptedKeys = config.listEncryptedKeys()
    const hasEncryptedKeys = config.hasEncryptedKeys()
    
    res.json({
      success: true,
      encryption: {
        enabled: hasEncryptedKeys,
        keysAvailable: encryptedKeys,
        masterPasswordProvided: !!config.masterPassword
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check key status',
      message: error.message
    })
  }
})

// Endpoint to test key decryption (for development/testing)
app.post('/api/keys/test', (req, res) => {
  const { keyName } = req.body
  
  if (!keyName) {
    return res.status(400).json({
      success: false,
      error: 'Key name is required'
    })
  }
  
  try {
    // Try to decrypt the key (this will throw if password is wrong or key doesn't exist)
    const decryptedKey = loadApiKey(keyName, config.masterPassword)
    
    res.json({
      success: true,
      message: `Key '${keyName}' can be decrypted successfully`,
      keyExists: !!decryptedKey,
      keyLength: decryptedKey ? decryptedKey.length : 0
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Key decryption failed',
      message: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`n8n webhook URL: ${N8N_WEBHOOK_URL}`)
  console.log('Use N8N_WEBHOOK_URL environment variable to configure the webhook URL')
})

export default app