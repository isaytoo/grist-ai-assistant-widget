# Grist AI Assistant Proxy Server

Secure proxy server for the Grist AI Assistant Widget that handles CORS and API key security.

## Features

- 🔒 **API Key Encryption**: Keys are encrypted and stored securely
- 🛡️ **CORS Handling**: Resolves CORS issues with AI provider APIs
- ⚡ **Rate Limiting**: Prevents abuse (100 requests per 15 minutes)
- 🔐 **Security Headers**: Helmet.js for additional security
- 🌍 **Multi-Provider Support**: Claude, OpenAI, Mistral, Groq, Perplexity

## Installation

```bash
cd api
npm install
```

## Configuration

Set environment variables:

```bash
# Encryption key for API keys (change in production!)
export ENCRYPTION_KEY="your-secure-encryption-key"

# Port (optional, defaults to 3000)
export PORT=3000
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Store API Key
```
POST /api/store-key
Content-Type: application/json

{
  "provider": "claude",
  "apiKey": "sk-ant-..."
}

Response:
{
  "keyId": "uuid-key-id"
}
```

### Claude API
```
POST /api/claude
Content-Type: application/json

{
  "keyId": "uuid-key-id",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "model": "claude-3-haiku-20240307"
}
```

### OpenAI API
```
POST /api/openai
Content-Type: application/json

{
  "keyId": "uuid-key-id",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "model": "gpt-3.5-turbo"
}
```

### Mistral API
```
POST /api/mistral
Content-Type: application/json

{
  "keyId": "uuid-key-id",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "model": "mistral-tiny"
}
```

### Groq API
```
POST /api/groq
Content-Type: application/json

{
  "keyId": "uuid-key-id",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "model": "llama3-8b-8192"
}
```

### Perplexity API
```
POST /api/perplexity
Content-Type: application/json

{
  "keyId": "uuid-key-id",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "model": "llama-3.1-sonar-small-128k-online"
}
```

## Security Features

1. **API Key Encryption**: Keys are encrypted using AES-256-GCM
2. **Rate Limiting**: 100 requests per 15 minutes per IP
3. **CORS Protection**: Only allows specific origins
4. **Security Headers**: Helmet.js provides additional security
5. **Request Size Limit**: 10MB max request size

## Deployment

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Heroku

```bash
heroku create grist-ai-proxy
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENCRYPTION_KEY` | Key for encrypting API keys | `default-key-change-in-production` |
| `PORT` | Server port | `3000` |

## Security Notes

⚠️ **Important**: Always change the `ENCRYPTION_KEY` in production!

- API keys are encrypted in memory only
- Keys are not persisted to disk (use Redis/DB for production)
- All requests are rate-limited
- CORS is strictly configured
- Security headers are applied automatically

## License

Apache 2.0 - see LICENSE file
