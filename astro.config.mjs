import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { nodeFunctions } from 'astro-node-functions';

// https://astro.build/config
export default defineConfig({
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
