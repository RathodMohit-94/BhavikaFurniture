import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173
  },
  optimizeDeps: {
    include: ['lucide-react', 'antd', 'react', 'react-dom', 'react-router-dom']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['antd', 'lucide-react']
        }
      }
    }
  }
});

