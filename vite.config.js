import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
  resolve: {
    dedupe: ['three', 'react', 'react-dom'],
  },
})