import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use /3D-Dhruv-Portfolio/ when deploying to GitHub Pages (set by CI),
  // fall back to '/' for local dev so nothing breaks.
  base: process.env.VITE_BASE_URL || '/',
});
