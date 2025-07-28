# AI Agent Chat UI

A full-stack chat interface that integrates with n8n for VOIP phone number verification and carrier validation.

## Architecture

```
[Frontend Chat UI]
     |
     | POST /api/chat
     |
[Backend Express Server]
     |
     | POST to n8n webhook
     |
[n8n Workflow - Docker]
     |
     | 1. Webhook node (/webhook/voip-verification)
     | 2. Extract phone number from message
     | 3. VOIP verification API call
     | 4. AI analysis for real person verification
     | 5. Return structured verification data
```

## Features

- Real-time chat interface for phone number verification
- VOIP detection and carrier identification
- AI-powered real person verification
- Predefined action buttons for verification workflows
- Responsive design with structured data display
- Error handling and loading states
- Docker support for easy deployment

## Quick Start

### Prerequisites

- Node.js 18+
- n8n instance running
- OpenRouter API key (for n8n workflow)

### Installation

1. Install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Configuration

1. Set up environment variables for the backend:

```bash
# In backend directory, create .env file
echo "N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat" > .env
```

2. Configure your n8n workflow:
   - Create a webhook node listening on `/webhook/chat`
   - Add OpenRouter Chat node for intent recognition
   - Return structured data in the format:
     ```json
     {
       "response": "Processing complete",
       "structuredData": {
         "origin": "Chicago",
         "destination": "Houston",
         "truckType": "dry van",
         "insurance": "1M"
       }
     }
     ```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Usage

1. Type a natural language message like: "I want to find a dry van from Chicago to Houston with 1M insurance"
2. The message is sent to the backend, which forwards it to n8n
3. n8n processes the message and returns structured data
4. The UI displays the extracted information and available actions

## Environment Variables

### Backend

- `N8N_WEBHOOK_URL`: URL of your n8n webhook (default: `http://localhost:5678/webhook/chat`)
- `PORT`: Server port (default: `3001`)

## API Endpoints

### POST /api/chat

Send a message for processing.

**Request:**
```json
{
  "message": "I want to find a dry van from Chicago to Houston"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Message processed successfully",
  "structuredData": {
    "origin": "Chicago",
    "destination": "Houston",
    "truckType": "dry van"
  }
}
```

### GET /api/health

Check server health and configuration.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "n8nWebhookUrl": "http://localhost:5678/webhook/chat"
}
```