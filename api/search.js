const axios = require('axios');

const urls = [
    "https://api.avtrdb.com/v2/avatar/search?query=",
    "https://api.avtr.zip/v1/search?q=",
    "https://requi.dev/vrcx_search.php?search="
];

module.exports = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    try {
        const requests = urls.map(url => 
            axios.get(`${url}${encodeURIComponent(q)}`, { 
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            })
            .then(r => r.data)
            .catch(() => null)
        );

        const responses = await Promise.all(requests);
        
        const results = responses
            .filter(Boolean)
            .flatMap(data => {
                // Handle different API response shapes
                if (Array.isArray(data)) return data;
                if (data.results && Array.isArray(data.results)) return data.results;
                if (data.avatars && Array.isArray(data.avatars)) return data.avatars;
                if (data.data && Array.isArray(data.data)) return data.data;
                return [];
            });

        // Remove duplicates by ID
        const seen = new Set();
        const uniqueResults = results.filter(item => {
            const id = item.id || item.avatarId;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        res.status(200).json(uniqueResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
