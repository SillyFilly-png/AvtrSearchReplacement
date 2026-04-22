export default async function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const endpoints = [
        `https://api.avtrdb.com/v2/avatar/search?query=${encodeURIComponent(q)}`,
        `https://api.avtr.zip/v1/search?q=${encodeURIComponent(q)}`,
        `https://requi.dev/vrcx_search.php?search=${encodeURIComponent(q)}`
    ];

    const headers = {
        'User-Agent': 'VRCX/1.0.0',
        'Accept': 'application/json',
        'Origin': 'https://vrcx-team.github.io',
        'Referer': 'https://vrcx-team.github.io/'
    };

    try {
        const responses = await Promise.all(
            endpoints.map(url => 
                fetch(url, { headers })
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            )
        );

        const merged = responses.filter(Boolean).flatMap(data => {
            if (Array.isArray(data)) return data;
            return data.results || data.avatars || data.data || [];
        });

        const normalized = merged.map(a => ({
            id: a.id || a.avatarId || a.avatar_id || "",
            name: a.name || a.avatarName || "Unknown",
            thumb: a.thumbnailImageUrl || a.imageUrl || a.image_url || a.thumbnail || "",
            author: a.authorName || a.author_name || "Unknown Author"
        })).filter(a => a.id && a.id.includes("avtr_"));

        // Unique by ID
        const unique = Array.from(new Map(normalized.map(item => [item.id, item])).values());

        res.status(200).json(unique);
    } catch (err) {
        res.status(200).json([]);
    }
}
