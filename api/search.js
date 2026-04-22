const axios = require('axios');

const ENDPOINTS = [
    "https://api.avtrdb.com/v2/avatar/search?query=",
    "https://api.avtr.zip/v1/search?q=",
    "https://requi.dev/vrcx_search.php?search="
];

module.exports = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'No query' });

    const axiosConfig = {
        timeout: 7000,
        headers: {
            'User-Agent': 'VRCX/1.0.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://vrcx-team.github.io',
            'Referer': 'https://vrcx-team.github.io/'
        }
    };

    try {
        const promises = ENDPOINTS.map(url => 
            axios.get(`${url}${encodeURIComponent(q)}`, axiosConfig)
                .then(r => r.data)
                .catch(() => null)
        );

        const responses = await Promise.all(promises);
        
        const merged = responses.filter(Boolean).flatMap(data => {
            if (Array.isArray(data)) return data;
            return data.results || data.avatars || data.data || [];
        });

        const normalized = merged.map(a => ({
            id: a.id || a.avatarId || a.avatar_id || "",
            name: a.name || a.avatarName || "Unknown",
            thumb: a.thumbnailImageUrl || a.imageUrl || a.image_url || a.thumbnail || "",
            author: a.authorName || a.author_name || "Unknown Author"
        })).filter(a => a.id.startsWith("avtr_"));

        const final = Array.from(new Map(normalized.map(item => [item.id, item])).values());

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(final);
    } catch (err) {
        res.status(500).json([]);
    }
};
