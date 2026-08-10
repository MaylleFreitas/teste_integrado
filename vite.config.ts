import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    // O projeto é publicado em:
    // https://mayllefreitas.github.io/teste_integrado/
    base: '/teste_integrado/',

    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // HMR é usado pelo AI Studio durante o desenvolvimento.
      // No GitHub Pages isso não interfere no build.
      hmr: process.env.DISABLE_HMR !== 'true',

      // Evita o file watching quando o AI Studio desabilita HMR.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
