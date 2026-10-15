// Vercel Serverless Function: Geocodificação Segura sem Restrições de CORS
export default async function handler(req, res) {
  // Configura cabeçalhos de CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const query = req.query?.q || (req.url ? new URL(req.url, 'http://localhost').searchParams.get('q') : '');

  if (!query || query.trim().length < 2) {
    return res.status(200).json([]);
  }

  try {
    const encoded = encodeURIComponent(query.trim());
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=br&limit=6&addressdetails=1&email=suporte@driversaas.app`;

    const osmRes = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://driversaas.vercel.app'
      }
    });

    if (!osmRes.ok) {
      return res.status(200).json([]);
    }

    const data = await osmRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Erro na geocodificação serverless:', err);
    return res.status(200).json([]);
  }
}
