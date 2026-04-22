const axios = require('axios');

const ENDPOINTS = [
    "https://api.avtrdb.com/v2/avatar/search?query=",
    "https://api.avtr.zip/v1/search?q=",
    "https://requi.dev/vrcx_search.php?search="
];

module.exports = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing query' });

    // This specific header setup is REQUIRED to bypass the "Not Found" block
    const config = {
        timeout: 8000,
        headers: {
            'User-Agent': 'VRCX/1.0.0',
            'Accept': 'application/json',
            'Origin': 'https://vrcx-team.github.io',
            'Referer': 'https://vrcx-team.github.io/'
        }
    };

    try {
        const fetchers = ENDPOINTS.map(url => 
            axios.get(`${url}${encodeURIComponent(q)}`, config)
                .then(r => r.data)
                .catch(e => {
                    console.log(`Endpoint failed: ${url}`);
                    return null;
                })
        );

        const rawResponses = await Promise.all(fetchers);
        
        const allAvatars = rawResponses
            .filter(Boolean)
            .flatMap(data => {
                // Parse varying response shapes from different DBs
                if (Array.isArray(data)) return data;
                if (data.results && Array.isArray(data.results)) return data.results;
                if (data.avatars && Array.isArray(data.avatars)) return data.avatars;
                if (data.data && Array.isArray(data.data)) return data.data;
                return [];
            });

        // Map everything to a standard format so the HTML doesn't break
        const normalized = allAvatars.map(a => ({
            id: a.id || a.avatarId || a.avatar_id || "",
            name: a.name || a.avatarName || "Unknown",
            thumb: a.thumbnailImageUrl || a.imageUrl || a.image_url || a.thumbnail || "",
            author: a.authorName || a.author_name || "Unknown Creator"
        })).filter(a => a.id.startsWith("avtr_"));

        // Remove duplicates
        const unique = Array.from(new Map(normalized.map(item => [item.id, item])).values());

        res.status(200).json(unique);
    } catch (err) {
        res.status(500).json({ error: 'Search Engine Error' });
    }
};

