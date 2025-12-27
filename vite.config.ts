
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 允许在代码中使用 process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    host: true, // 允许局域网访问
    port: 3000
  }
});
