import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["sockjs-client/dist/sockjs"],
  },
  server:{
    port: 3000,
  }
})
