const axios = require('axios');

const urls = [
    "https://api.avtrdb.com/v2/avatar/search?query=",
    "https://api.avtr.zip/v1/search?q=",
    "https://requi.dev/vrcx_search.php?search="
];

module.exports = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing query' });

    try {
        const requests = urls.map(url => 
            axios.get(`${url}${encodeURIComponent(q)}`, { timeout: 3000 })
                .then(r => r.data)
                .catch(() => null)
        );

        const rawResults = await Promise.all(requests);
        
        const cleanResults = rawResults
            .filter(Boolean)
            .flatMap(data => {
                if (Array.isArray(data)) return data;
                if (data.results) return data.results;
                if (data.avatars) return data.avatars;
                return [];
            });

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(cleanResults));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

