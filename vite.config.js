import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Level Up! 考研助手',
        short_name: 'LevelUp',
        description: 'Gamified Study Timer for Post-grad Entrance Exam',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait', // 强制竖屏，解决黄色警告
        icons: [
          // 使用 PNG 格式，安卓打包必须要 PNG
          {
            src: 'https://placehold.co/192x192/8B5CF6/FFFFFF/png?text=LevelUp',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'https://placehold.co/512x512/8B5CF6/FFFFFF/png?text=LevelUp',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})