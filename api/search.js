export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) return new Response(JSON.stringify({ error: "Empty query" }), { status: 400 });

  // 2026 Direct Database Endpoint
  const url = `https://api.avtrdb.com/v2/avatar/search?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VRCX/2026.02.11', // Matches the latest verified handshake
        'Accept': 'application/json',
        'Origin': 'https://avtrdb.com'
      }
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Database Timed Out" }), { status: 500 });
  }
}
