// Vercel Serverless Function - AI API Proxy (Claude, OpenAI, Mistral, Groq, Perplexity)

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { provider, apiKey, messages, model } = req.body;

        if (!provider || !apiKey || !messages) {
            return res.status(400).json({ error: 'Provider, API key and messages required' });
        }

        let response;

        switch (provider) {
            case 'claude':
                response = await fetch('https://api.anthropic.com/v1/messages', {
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
                break;

            case 'openai':
                response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                break;

            case 'mistral':
                response = await fetch('https://api.mistral.ai/v1/chat/completions', {
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
                break;

            case 'groq':
                response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                break;

            case 'perplexity':
                response = await fetch('https://api.perplexity.ai/chat/completions', {
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
                break;

            default:
                return res.status(400).json({ error: 'Unknown provider' });
        }

        const data = await response.json();
        return res.status(response.status).json(data);

    } catch (error) {
        console.error('AI proxy error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
