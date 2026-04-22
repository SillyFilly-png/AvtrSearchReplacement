const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const url = `https://api.avtrdb.com/v2/avatar/search?query=${encodeURIComponent(q)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'VRCX/1.2.0',
                'Accept': 'application/json',
                'Referer': 'https://vrcx-team.github.io/',
                'Origin': 'https://vrcx-team.github.io'
            },
            timeout: 8000
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `API Blocked: ${response.status}` });
        }

        const data = await response.json();
        
        // Normalize results
        const results = (Array.isArray(data) ? data : (data.results || [])).map(a => ({
            id: a.id || a.avatarId || "",
            name: a.name || "Unknown Avatar",
            thumb: a.thumbnailImageUrl || a.imageUrl || ""
        })).filter(a => a.id.includes("avtr_"));

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: "Connection Failed", details: err.message });
    }
};

