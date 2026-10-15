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

  const urlObj = req.url ? new URL(req.url, 'http://localhost') : null;
  const lat = req.query?.lat || urlObj?.searchParams.get('lat');
  const lon = req.query?.lon || urlObj?.searchParams.get('lon');
  const query = req.query?.q || urlObj?.searchParams.get('q') || '';

  // 1. Geocodificação Reversa (coordenadas para endereço real)
  if (lat && lon) {
    try {
      const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1&email=suporte@driversaas.app`;
      const revRes = await fetch(revUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://driversaas.vercel.app'
        }
      });
      if (revRes.ok) {
        const revData = await revRes.json();
        return res.status(200).json(revData || {});
      }
      return res.status(200).json({});
    } catch (e) {
      return res.status(200).json({});
    }
  }

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

    let data = [];
    if (osmRes.ok) {
      data = await osmRes.json();
    }

    // Se não encontrou e a busca contém número ou complemento, tenta buscar o logradouro
    if ((!Array.isArray(data) || data.length === 0) && (/\d+/.test(query) || query.includes('-') || query.includes(','))) {
      const cleanStreet = query
        .replace(/,\s*\d+.*$/, '')
        .replace(/\b\d+\b.*$/, '')
        .replace(/-.*$/, '')
        .trim();

      if (cleanStreet.length >= 3) {
        const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanStreet)}&countrycodes=br&limit=6&addressdetails=1&email=suporte@driversaas.app`;
        const fbRes = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://driversaas.vercel.app'
          }
        });
        if (fbRes.ok) {
          data = await fbRes.json();
        }
      }
    }

    return res.status(200).json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Erro na geocodificação serverless:', err);
    return res.status(200).json([]);
  }
}
