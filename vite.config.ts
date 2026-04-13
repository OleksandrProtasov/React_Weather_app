import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site: https://johnyfours.github.io/React_Weather_app/
export default defineConfig({
  plugins: [react()],
  base: '/React_Weather_app/',
});
