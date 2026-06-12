import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        login: path.resolve(__dirname, 'pages/login.html'),
        register: path.resolve(__dirname, 'pages/register.html'),
        dashboard: path.resolve(__dirname, 'pages/dashboard.html'),
        transactions: path.resolve(__dirname, 'pages/transactions.html'),
        goals: path.resolve(__dirname, 'pages/goals.html'),
        agenda: path.resolve(__dirname, 'pages/agenda.html'),
        categories: path.resolve(__dirname, 'pages/categories.html'),
        settings: path.resolve(__dirname, 'pages/settings.html'),
        profile: path.resolve(__dirname, 'pages/profile.html'),
        onboarding: path.resolve(__dirname, 'pages/onboarding.html'),
      },
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
