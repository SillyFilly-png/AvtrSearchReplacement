const axios = require('axios');
const urls = require('./config');

module.exports = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const requests = urls.map(url => 
            axios.get(`${url}${encodeURIComponent(q)}`, { timeout: 5000 })
                .then(response => response.data)
                .catch(err => {
                    console.error(`Error fetching from ${url}:`, err.message);
                    return null;
                })
        );

        const results = await Promise.all(requests);
        
        // Flatten and normalize data from all sources
        const combinedResults = results
            .filter(data => data !== null)
            .flatMap(data => {
                if (Array.isArray(data)) return data;
                if (data.results && Array.isArray(data.results)) return data.results;
                if (data.avatars && Array.isArray(data.avatars)) return data.avatars;
                return [];
            });

        res.status(200).json(combinedResults);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
