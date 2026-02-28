// Vercel Serverless Function - Grist API Proxy

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
        const { gristUrl, gristApiKey, docId, action, tables } = req.body;

        if (!gristUrl || !gristApiKey || !docId) {
            return res.status(400).json({ error: 'Grist URL, API key and doc ID required' });
        }

        // Clean URL (remove trailing slashes and double slashes)
        const cleanUrl = gristUrl.replace(/\/+$/, '').replace(/([^:]\/)\/+/g, '$1');

        let response;

        if (action === 'tables') {
            // Create tables
            response = await fetch(`${cleanUrl}/api/docs/${docId}/tables`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${gristApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tables })
            });
        } else if (action === 'records') {
            // Insert records into a table
            const { tableName, records } = req.body;
            if (!tableName || !records) {
                return res.status(400).json({ error: 'Table name and records required' });
            }
            response = await fetch(`${cleanUrl}/api/docs/${docId}/tables/${tableName}/records`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${gristApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ records })
            });
        } else if (action === 'columns') {
            // Add columns to a table (with optional formula)
            const { tableName, columns } = req.body;
            if (!tableName || !columns) {
                return res.status(400).json({ error: 'Table name and columns required' });
            }
            response = await fetch(`${cleanUrl}/api/docs/${docId}/tables/${tableName}/columns`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${gristApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ columns })
            });
        } else if (action === 'getTables') {
            // Get all tables with their columns
            response = await fetch(`${cleanUrl}/api/docs/${docId}/tables`, {
                headers: { 'Authorization': `Bearer ${gristApiKey}` }
            });
        } else if (action === 'getColumns') {
            // Get columns for a specific table
            const { tableName } = req.body;
            if (!tableName) {
                return res.status(400).json({ error: 'Table name required' });
            }
            response = await fetch(`${cleanUrl}/api/docs/${docId}/tables/${tableName}/columns`, {
                headers: { 'Authorization': `Bearer ${gristApiKey}` }
            });
        } else if (action === 'getRecords') {
            // Get records from a table
            const { tableName, limit } = req.body;
            if (!tableName) {
                return res.status(400).json({ error: 'Table name required' });
            }
            const url = limit 
                ? `${cleanUrl}/api/docs/${docId}/tables/${tableName}/records?limit=${limit}`
                : `${cleanUrl}/api/docs/${docId}/tables/${tableName}/records`;
            response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${gristApiKey}` }
            });
        } else {
            // Test connection (default)
            response = await fetch(`${cleanUrl}/api/docs/${docId}`, {
                headers: { 'Authorization': `Bearer ${gristApiKey}` }
            });
        }

        const data = await response.json();
        return res.status(response.status).json(data);

    } catch (error) {
        console.error('Grist proxy error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
