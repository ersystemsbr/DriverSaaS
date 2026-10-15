import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dev-api-geocode',
      configureServer(server) {
        server.middlewares.use('/api/geocode', async (req, res) => {
          const url = new URL(req.url, 'http://localhost:3000');
          const q = url.searchParams.get('q');
          const lat = url.searchParams.get('lat');
          const lon = url.searchParams.get('lon');

          // Reverse geocoding local
          if (lat && lon) {
            try {
              const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1&email=suporte@driversaas.app`;
              const osmRes = await fetch(revUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Referer': 'http://localhost:3000'
                }
              });
              let revData = {};
              if (osmRes.ok) {
                revData = await osmRes.json();
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(revData || {}));
              return;
            } catch (e) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({}));
              return;
            }
          }

          if (!q) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([]));
            return;
          }
          try {
            const encoded = encodeURIComponent(q);
            const osmRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=br&limit=6&addressdetails=1&email=suporte@driversaas.app`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Referer': 'http://localhost:3000'
                }
              }
            );
            let data = [];
            if (osmRes.ok) {
              data = await osmRes.json();
            }

            if ((!Array.isArray(data) || data.length === 0) && (/\d+/.test(q) || q.includes('-') || q.includes(','))) {
              const cleanStreet = q.replace(/,\s*\d+.*$/, '').replace(/\b\d+\b.*$/, '').replace(/-.*$/, '').trim();
              if (cleanStreet.length >= 3) {
                const fbUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanStreet)}&countrycodes=br&limit=6&addressdetails=1&email=suporte@driversaas.app`;
                const fbRes = await fetch(fbUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'http://localhost:3000'
                  }
                });
                if (fbRes.ok) {
                  data = await fbRes.json();
                }
              }
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(Array.isArray(data) ? data : []));
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([]));
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
