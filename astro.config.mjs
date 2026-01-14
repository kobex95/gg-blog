import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  integrations: [
    tailwind(),
    react()
  ],
  vite: {
    optimizeDeps: {
      exclude: ['@libsql/client']
    }
  },
  build: {
    assets: '_astro',
  },
  server: {
    port: 3000
  }
});
