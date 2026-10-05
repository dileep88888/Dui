import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      tailwindcss(),
      {
        name: 'serve-style-css',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url || '';
            if (url === '/style.css' || url.startsWith('/style.css?')) {
              try {
                const result = await server.transformRequest('/style.css?direct');
                if (result) {
                  res.setHeader('Content-Type', 'text/css');
                  res.end(result.code);
                  return;
                }
              } catch (e) {
                console.error('Error transforming style.css:', e);
              }
            }
            next();
          });
        },
      } as Plugin,
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
