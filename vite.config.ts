import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ivoryScholar: resolve(__dirname, 'ivory-scholar.html'),
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 8765,
  },
});
