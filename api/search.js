const axios = require('axios');
const repos = require('./config');

export default async function handler(req, res) {
    const { q } = req.query;
    try {
        const requests = repos.map(url => 
            axios.get(`${url}${q}`, { timeout: 2500 }).catch(() => ({ data: null }))
        );
        const responses = await Promise.all(requests);
        let combined = [];
        responses.forEach(resp => {
            if (!resp.data) return;
            const data = resp.data.avatars || resp.data.results || (Array.isArray(resp.data) ? resp.data : []);
            combined = [...combined, ...data];
        });
        res.status(200).json(combined);
    } catch (e) {
        res.status(500).json({ error: "API Error" });
    }
}

