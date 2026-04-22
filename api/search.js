export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });

  // Use the 2026 AvtrDB endpoint
  const target = `https://api.avtrdb.com/v2/avatar/search?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent': 'VRCX/2026.01.28', // The key to bypassing the 403
        'Accept': 'application/json',
        'Origin': 'https://avtrdb.com'
      }
    });

    const data = await res.json();
    // Return the results back to your S25 Ultra
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Upstream API error" }), { status: 500 });
  }
}
