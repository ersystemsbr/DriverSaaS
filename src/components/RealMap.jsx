import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function RealMap({ 
  center = [-23.561684, -46.655981], // São Paulo centro padrão
  zoom = 14,
  originCoords = null,
  destCoords = null,
  routeCoordinates = null,
  driverCoords = null,
  isOnline = false,
  height = '320px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializa o mapa Leaflet se ainda não existir
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false
      });

      // OpenStreetMap Oficial (100% Gratuito, Sem necessidade de API Key)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Adiciona controle de zoom no canto inferior direito
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Marcador do Motorista com efeito de radar (Apenas se driverCoords for informado)
    if (driverCoords) {
      const carIconHtml = `
        <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          ${isOnline ? '<div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(34, 197, 94, 0.35); border: 1.5px solid #22c55e; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          <div style="width: 32px; height: 32px; border-radius: 12px; background: ${isOnline ? '#22c55e' : '#3f3f46'}; color: #000; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5); border: 2px solid #fff;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <path d="M9 17h6"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
        </div>
      `;

      const carIcon = L.divIcon({
        html: carIconHtml,
        className: 'custom-driver-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const lat = driverCoords.lat || driverCoords[0];
      const lng = driverCoords.lng || driverCoords[1];
      L.marker([lat, lng], { icon: carIcon }).addTo(layerGroup);
    }

    // 2. Marcador de Ponto de Embarque (Parada)
    if (originCoords && originCoords.lat && originCoords.lng) {
      const originIcon = L.divIcon({
        html: `
          <div style="background: #22c55e; color: #000; width: 32px; height: 32px; border-radius: 9999px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; border: 2.5px solid #fff; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.7);">
            <span>1</span>
          </div>
        `,
        className: 'origin-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([originCoords.lat, originCoords.lng], { icon: originIcon })
        .addTo(layerGroup)
        .bindPopup('<b>Parada 1: Embarque do Passageiro</b>');
    }

    // 3. Marcador de Destino Final
    if (destCoords && destCoords.lat && destCoords.lng) {
      const destIcon = L.divIcon({
        html: `
          <div style="background: #3b82f6; color: #fff; width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; border: 2.5px solid #fff; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.7);">
            <span>2</span>
          </div>
        `,
        className: 'dest-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([destCoords.lat, destCoords.lng], { icon: destIcon })
        .addTo(layerGroup)
        .bindPopup('<b>Destino Final da Corrida</b>');
    }

    // 4. Polilinha da Rota Real e Enquadramento de Câmera
    if (routeCoordinates && routeCoordinates.length > 0) {
      const polyline = L.polyline(routeCoordinates, {
        color: '#22c55e',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Linha de contorno externa
      L.polyline(routeCoordinates, {
        color: '#15803d',
        weight: 9,
        opacity: 0.4,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      try {
        map.fitBounds(polyline.getBounds(), { padding: [45, 45], maxZoom: 16 });
      } catch (e) {}
    } else if (driverCoords && originCoords && destCoords && originCoords.lat && destCoords.lat) {
      try {
        const dLat = driverCoords.lat || driverCoords[0];
        const dLng = driverCoords.lng || driverCoords[1];
        const bounds = L.latLngBounds([
          [dLat, dLng],
          [originCoords.lat, originCoords.lng],
          [destCoords.lat, destCoords.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } catch (e) {}
    } else if (originCoords && destCoords && originCoords.lat && destCoords.lat) {
      try {
        const bounds = L.latLngBounds([
          [originCoords.lat, originCoords.lng],
          [destCoords.lat, destCoords.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } catch (e) {}
    } else if (originCoords && originCoords.lat) {
      map.setView([originCoords.lat, originCoords.lng], 15);
    } else if (destCoords && destCoords.lat) {
      map.setView([destCoords.lat, destCoords.lng], 15);
    } else if (driverCoords) {
      const lat = driverCoords.lat || driverCoords[0];
      const lng = driverCoords.lng || driverCoords[1];
      map.setView([lat, lng], zoom);
    } else if (center) {
      const lat = center.lat || center[0];
      const lng = center.lng || center[1];
      map.setView([lat, lng], zoom);
    }

    // Atualiza o tamanho do mapa caso as dimensões mudem
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

  }, [center, zoom, originCoords, destCoords, routeCoordinates, driverCoords, isOnline]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-[#121215] dark-osm-map">
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%' }}
        className="z-10"
      />
    </div>
  );
}
