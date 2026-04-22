export const config = { runtime: 'edge' };

export default async function handler(req) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    if (!q) return new Response(JSON.stringify([]), { status: 200 });

    const endpoints = [
        `https://api.avtrdb.com/v2/avatar/search?query=${encodeURIComponent(q)}`,
        `https://api.avtr.zip/v1/search?q=${encodeURIComponent(q)}`
    ];

    const headers = {
        'User-Agent': 'VRCX/1.0.0',
        'Accept': 'application/json',
        'Origin': 'https://vrcx-team.github.io',
        'Referer': 'https://vrcx-team.github.io/'
    };

    try {
        const results = await Promise.all(
            endpoints.map(url => 
                fetch(url, { headers })
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            )
        );

        const merged = results.filter(Boolean).flatMap(data => {
            if (Array.isArray(data)) return data;
            return data.results || data.avatars || data.data || [];
        });

        const normalized = merged.map(a => ({
            id: a.id || a.avatarId || "",
            name: a.name || "Unknown",
            thumb: a.thumbnailImageUrl || a.imageUrl || ""
        })).filter(a => a.id.startsWith("avtr_"));

        // Remove duplicates
        const unique = Array.from(new Map(normalized.map(item => [item.id, item])).values());

        return new Response(JSON.stringify(unique), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify([]), { status: 200 });
    }
}

