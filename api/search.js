const axios = require('axios');

const PROVIDERS = [
    "https://api.avtrdb.com/v2/avatar/search?query=",
    "https://api.avtr.zip/v1/search?q=",
    "https://requi.dev/vrcx_search.php?search="
];

module.exports = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    // Set headers to mimic VRCX / Chrome
    const config = {
        timeout: 6000,
        headers: {
            'User-Agent': 'VRCX/1.0.0',
            'Accept': 'application/json',
            'Referer': 'https://vrcx-team.github.io/VRCX/'
        }
    };

    try {
        const requests = PROVIDERS.map(url => 
            axios.get(`${url}${encodeURIComponent(q)}`, config)
                .then(r => r.data)
                .catch(err => {
                    console.log(`Failed: ${url} - ${err.message}`);
                    return null;
                })
        );

        const rawData = await Promise.all(requests);
        
        // Deep parsing to find the avatar list in any response format
        const combined = rawData
            .filter(Boolean)
            .flatMap(data => {
                if (Array.isArray(data)) return data;
                if (data.results && Array.isArray(data.results)) return data.results;
                if (data.avatars && Array.isArray(data.avatars)) return data.avatars;
                if (data.data && Array.isArray(data.data)) return data.data;
                return [];
            });

        // Normalize data so the HTML always finds the right fields
        const normalized = combined.map(item => ({
            id: item.id || item.avatarId || item.id_avatar || "",
            name: item.name || item.avatarName || "Unknown Avatar",
            thumbnail: item.thumbnailImageUrl || item.imageUrl || item.image_url || item.thumbnail || "",
            author: item.authorName || item.author_name || "Unknown Author"
        })).filter(item => item.id !== "");

        // Deduplicate
        const unique = Array.from(new Map(normalized.map(a => [a.id, a])).values());

        res.status(200).json(unique);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

