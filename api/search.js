export default async function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const url = `https://api.avtrdb.com/v2/avatar/search?query=${encodeURIComponent(q)}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'VRCX/1.0.0',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`API responded with ${response.status}`);
        
        const data = await response.json();
        
        // Return exactly what the API gives us to verify it works
        const results = Array.isArray(data) ? data : (data.results || []);
        
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
