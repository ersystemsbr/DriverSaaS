// Serviço de Mapas, Geocodificação (Busca de Endereços) e Roteamento Real

// 1. Obter GPS real do dispositivo (celular ou computador)
export const getDeviceLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: -23.561684, lng: -46.655981 }); // Av. Paulista fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        console.warn('GPS não autorizado ou indisponível, usando coordenada padrão:', err.message);
        resolve({ lat: -23.561684, lng: -46.655981 }); // Av. Paulista
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
};

// Dicionário de atalhos rápidos para pontos de referência populares
const POPULAR_PLACES = [
  { keywords: ['paulista', 'av paulista', 'avenida paulista'], short_name: 'Av. Paulista, 1578 - Bela Vista, São Paulo', lat: -23.561684, lng: -46.655981 },
  { keywords: ['congonhas', 'aeroporto congonhas', 'aeroporto de congonhas'], short_name: 'Aeroporto de Congonhas - Embarque, São Paulo', lat: -23.627325, lng: -46.656534 },
  { keywords: ['faria lima', 'av faria lima', 'brigadeiro faria lima'], short_name: 'Av. Brig. Faria Lima, 3477 - Itaim Bibi, São Paulo', lat: -23.586612, lng: -46.682613 },
  { keywords: ['ibirapuera', 'parque ibirapuera', 'shopping ibirapuera'], short_name: 'Shopping Ibirapuera - Moema, São Paulo', lat: -23.610214, lng: -46.666872 },
  { keywords: ['guarulhos', 'gru', 'aeroporto guarulhos'], short_name: 'Aeroporto Internacional de Guarulhos (GRU)', lat: -23.435555, lng: -46.473055 },
  { keywords: ['tiete', 'rodoviaria tiete'], short_name: 'Terminal Rodoviário Tietê, São Paulo', lat: -23.516245, lng: -46.624792 },
  { keywords: ['vila olimpia', 'vila olímpia'], short_name: 'Vila Olímpia - São Paulo, SP', lat: -23.593721, lng: -46.685324 },
  { keywords: ['morumbi', 'shopping morumbi'], short_name: 'Morumbi Shopping - Av. Roque Petroni Jr, São Paulo', lat: -23.622812, lng: -46.698944 }
];

// 2. Busca e autocompletar de endereços reais no Brasil
export const searchAddressNominatim = async (query) => {
  if (!query || query.trim().length < 2) return [];

  const clean = query.trim().toLowerCase();
  
  // 1. Checa correspondência rápida no catálogo de locais populares
  const matchedShortcuts = POPULAR_PLACES.filter(p => 
    p.keywords.some(k => k.includes(clean) || clean.includes(k))
  ).map(p => ({
    display_name: p.short_name,
    short_name: p.short_name,
    lat: p.lat,
    lng: p.lng
  }));

  try {
    const encoded = encodeURIComponent(query.trim());
    
    // Tenta primeiro o endpoint local/serverless /api/geocode (sem restrição de CORS)
    let res = await fetch(`/api/geocode?q=${encoded}`);
    
    if (!res.ok) {
      // Fallback para chamada direta sem headers restritos
      res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=br&limit=6&addressdetails=1&email=suporte@driversaas.app`);
    }

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const parsed = data.map((item) => ({
          display_name: item.display_name,
          short_name: formatShortAddress(item),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));

        // Junta atalhos correspondentes no topo sem duplicatas
        const combined = [...matchedShortcuts];
        parsed.forEach(item => {
          if (!combined.some(c => Math.abs(c.lat - item.lat) < 0.001 && Math.abs(c.lng - item.lng) < 0.001)) {
            combined.push(item);
          }
        });
        return combined.slice(0, 6);
      }
    }
  } catch (err) {
    console.warn('Busca de endereço via API falhou, usando lista local:', err);
  }

  return matchedShortcuts;
};

// Geocodifica uma string de endereço diretamente para coordenadas
export const geocodeAddress = async (query) => {
  if (!query) return null;
  const results = await searchAddressNominatim(query);
  return results.length > 0 ? results[0] : null;
};

export const formatShortAddress = (item) => {
  if (!item) return '';
  const addr = item.address || {};
  const road = addr.road || addr.pedestrian || addr.suburb || item.name || '';
  const house = addr.house_number ? `, ${addr.house_number}` : '';
  const suburb = addr.suburb && addr.suburb !== road ? ` - ${addr.suburb}` : '';
  const city = addr.city || addr.town || addr.municipality || 'São Paulo';
  if (road) {
    return `${road}${house}${suburb}, ${city}`;
  }
  return item.display_name?.split(',').slice(0, 3).join(',') || item.display_name || 'Endereço detectado';
};

// 2.1 Geocodificação Reversa (coordenadas para nome da rua)
export const reverseGeocode = async (coords) => {
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return null;
  try {
    let res = await fetch(`/api/geocode?lat=${coords.lat}&lon=${coords.lng}`);
    if (!res.ok) {
      res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1&email=suporte@driversaas.app`);
    }
    if (res.ok) {
      const data = await res.json();
      if (data && (data.display_name || data.address)) {
        return formatShortAddress(data);
      }
    }
  } catch (err) {
    console.warn('Erro na geocodificação reversa:', err);
  }
  return null;
};

// 3. Cálculo de rota real, distância por ruas e polilinha no mapa (OSRM - Open Source Routing Machine)
export const calculateRealRoute = async (originCoords, destCoords) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao traçar rota OSRM');

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('Nenhuma rota encontrada');
    }

    const route = data.routes[0];
    const distanceKm = +(route.distance / 1000).toFixed(1); // Metros para Km
    const durationMin = Math.ceil(route.duration / 60); // Segundos para minutos
    
    // Converte [lng, lat] do GeoJSON para [lat, lng] do Leaflet
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return {
      distanceKm,
      durationMin,
      coordinates
    };
  } catch (err) {
    console.warn('Erro ao consultar OSRM, calculando rota aproximada:', err);
    // Fallback geométrico (Fórmula Haversine) caso serviço de roteamento demore
    const dist = calculateHaversineDistance(originCoords, destCoords);
    return {
      distanceKm: dist,
      durationMin: Math.max(5, Math.ceil(dist * 2.2)),
      coordinates: [
        [originCoords.lat, originCoords.lng],
        [destCoords.lat, destCoords.lng]
      ]
    };
  }
};

// Cálculo aproximado de distância em linha reta * fator de curvas urbanas (1.3x)
const calculateHaversineDistance = (coord1, coord2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDist = R * c;
  return +(straightDist * 1.35).toFixed(1); // Fator de ruas
};
