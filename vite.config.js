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
            if (!osmRes.ok) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify([]));
              return;
            }
            const data = await osmRes.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
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
    open: false
  }
});
