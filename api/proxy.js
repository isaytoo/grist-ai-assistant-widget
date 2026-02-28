// Vercel Serverless Function - API Proxy for Grist AI Assistant
const crypto = require('crypto');

// In-memory storage (reset on each cold start - for production use Redis/DB)
const encryptedKeys = new Map();

// Encryption functions
function encrypt(text) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'gristup-default-key-2026', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return { encrypted, iv: iv.toString('hex'), authTag: authTag.toString('hex') };
}

function decrypt(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'gristup-default-key-2026', 'salt', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async (req, res) => {
    setCorsHeaders(res);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url, method, body } = req;
    const path = url.split('?')[0];

    try {
        // Health check
        if (path === '/api/proxy' || path === '/api/proxy/health') {
            return res.json({ status: 'ok', timestamp: new Date().toISOString() });
        }

        // Store API key
        if (path === '/api/proxy/store-key' && method === 'POST') {
            const { provider, apiKey } = body;
            if (!provider || !apiKey) {
                return res.status(400).json({ error: 'Provider and API key required' });
            }
            const encrypted = encrypt(apiKey);
            const keyId = crypto.randomUUID();
            encryptedKeys.set(keyId, { provider, ...encrypted });
            return res.json({ keyId });
        }

        // Claude API
        if (path === '/api/proxy/claude' && method === 'POST') {
            const { keyId, messages, model } = body;
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
            return res.status(response.status).json(data);
        }

        // OpenAI API
        if (path === '/api/proxy/openai' && method === 'POST') {
            const { keyId, messages, model } = body;
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
            return res.status(response.status).json(data);
        }

        // Mistral API
        if (path === '/api/proxy/mistral' && method === 'POST') {
            const { keyId, messages, model } = body;
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
            return res.status(response.status).json(data);
        }

        // Groq API
        if (path === '/api/proxy/groq' && method === 'POST') {
            const { keyId, messages, model } = body;
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
            return res.status(response.status).json(data);
        }

        // Perplexity API
        if (path === '/api/proxy/perplexity' && method === 'POST') {
            const { keyId, messages, model } = body;
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
            return res.status(response.status).json(data);
        }

        // Grist API - Test connection
        if (path === '/api/proxy/grist' && method === 'POST') {
            const { gristUrl, gristApiKey, docId } = body;
            if (!gristUrl || !gristApiKey || !docId) {
                return res.status(400).json({ error: 'Grist URL, API key and doc ID required' });
            }
            const response = await fetch(`${gristUrl}/api/docs/${docId}`, {
                headers: { 'Authorization': `Bearer ${gristApiKey}` }
            });
            const data = await response.json();
            return res.status(response.status).json(data);
        }

        // Grist API - Create table
        if (path === '/api/proxy/grist/tables' && method === 'POST') {
            const { gristUrl, gristApiKey, docId, tables } = body;
            if (!gristUrl || !gristApiKey || !docId) {
                return res.status(400).json({ error: 'Grist URL, API key and doc ID required' });
            }
            const response = await fetch(`${gristUrl}/api/docs/${docId}/tables`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${gristApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tables })
            });
            const data = await response.json();
            return res.status(response.status).json(data);
        }

        return res.status(404).json({ error: 'Not found' });

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
