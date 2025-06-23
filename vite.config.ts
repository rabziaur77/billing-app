import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const isProd = process.env.NODE_ENV === 'production'
export default defineConfig({
  base: isProd? '/billing-app/':'/',
  plugins: [react()],
})
