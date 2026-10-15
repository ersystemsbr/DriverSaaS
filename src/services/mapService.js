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

// 2. Busca e autocompletar de endereços reais no Brasil (OpenStreetMap Nominatim)
export const searchAddressNominatim = async (query) => {
  if (!query || query.trim().length < 3) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=br&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'User-Agent': 'DriverSaaS-App'
        }
      }
    );

    if (!res.ok) return [];
    const data = await res.json();

    return data.map((item) => ({
      display_name: item.display_name,
      short_name: formatShortAddress(item),
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (err) {
    console.error('Erro ao buscar endereço:', err);
    return [];
  }
};

const formatShortAddress = (item) => {
  const addr = item.address || {};
  const road = addr.road || addr.pedestrian || addr.suburb || item.name || '';
  const house = addr.house_number ? `, ${addr.house_number}` : '';
  const city = addr.city || addr.town || addr.municipality || 'São Paulo';
  const state = addr.state ? ` - ${addr.state}` : '';
  return `${road}${house}${road ? ' - ' : ''}${city}${state}` || item.display_name;
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
