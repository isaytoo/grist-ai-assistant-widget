// API Proxy for Grist AI Assistant Widget
// Handles CORS and API key security

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: [
        'https://isaytoo.github.io',
        'https://grist-ai-assistant-widget.vercel.app',
        'http://localhost:3000',
        'http://localhost:8080'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

// In-memory encrypted storage for API keys (in production, use Redis/DB)
const encryptedKeys = new Map();

// Encryption/Decryption functions
function encrypt(text) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return { encrypted, iv: iv.toString('hex'), authTag: authTag.toString('hex') };
}

function decrypt(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

// Store encrypted API key
app.post('/api/store-key', (req, res) => {
    const { provider, apiKey } = req.body;
    
    if (!provider || !apiKey) {
        return res.status(400).json({ error: 'Provider and API key required' });
    }
    
    // Encrypt and store the key
    const encrypted = encrypt(apiKey);
    const keyId = crypto.randomUUID();
    encryptedKeys.set(keyId, { provider, ...encrypted });
    
    // Return only the keyId (never return the actual key)
    res.json({ keyId });
});

// Claude API proxy
app.post('/api/claude', async (req, res) => {
    try {
        const { keyId, messages, model } = req.body;
        const storedKey = encryptedKeys.get(keyId);
        
        if (!storedKey) {
            return res.status(400).json({ error: 'Invalid key ID' });
        }
        
        const apiKey = decrypt(storedKey);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model || 'claude-3-haiku-20240307',
                max_tokens: 1000,
                messages
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Claude API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// OpenAI API proxy
app.post('/api/openai', async (req, res) => {
    try {
        const { keyId, messages, model } = req.body;
        const storedKey = encryptedKeys.get(keyId);
        
        if (!storedKey) {
            return res.status(400).json({ error: 'Invalid key ID' });
        }
        
        const apiKey = decrypt(storedKey);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'gpt-3.5-turbo',
                max_tokens: 1000,
                messages
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mistral API proxy
app.post('/api/mistral', async (req, res) => {
    try {
        const { keyId, messages, model } = req.body;
        const storedKey = encryptedKeys.get(keyId);
        
        if (!storedKey) {
            return res.status(400).json({ error: 'Invalid key ID' });
        }
        
        const apiKey = decrypt(storedKey);
        
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'mistral-tiny',
                max_tokens: 1000,
                messages
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Mistral API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Groq API proxy
app.post('/api/groq', async (req, res) => {
    try {
        const { keyId, messages, model } = req.body;
        const storedKey = encryptedKeys.get(keyId);
        
        if (!storedKey) {
            return res.status(400).json({ error: 'Invalid key ID' });
        }
        
        const apiKey = decrypt(storedKey);
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'llama3-8b-8192',
                max_tokens: 1000,
                messages
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Groq API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Perplexity API proxy
app.post('/api/perplexity', async (req, res) => {
    try {
        const { keyId, messages, model } = req.body;
        const storedKey = encryptedKeys.get(keyId);
        
        if (!storedKey) {
            return res.status(400).json({ error: 'Invalid key ID' });
        }
        
        const apiKey = decrypt(storedKey);
        
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'llama-3.1-sonar-small-128k-online',
                max_tokens: 1000,
                messages
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Perplexity API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`AI Proxy Server running on port ${PORT}`);
});
