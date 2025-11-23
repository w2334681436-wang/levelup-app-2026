import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        // --- 1. 基础信息 (必填) ---
        name: 'Level Up! 考研助手',
        short_name: 'LevelUp',
        description: 'Gamified Study Timer for Post-grad Entrance Exam',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        
        // --- 2. 修复 ID 和 方向 (解决黄色警告) ---
        id: '/', 
        start_url: '/',
        orientation: 'portrait', // 强制竖屏
        
        // --- 3. 修复分类 (解决黄色警告) ---
        categories: ['productivity', 'education'],

        // --- 4. 修复图标 (使用 DiceBear 稳定源，解决 404 红色报错) ---
        icons: [
          {
            // 192x192 PNG
            src: 'https://api.dicebear.com/9.x/initials/png?seed=LU&backgroundColor=000000&textColor=00ffcc&size=192',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            // 512x512 PNG
            src: 'https://api.dicebear.com/9.x/initials/png?seed=LU&backgroundColor=000000&textColor=00ffcc&size=512',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            // 掩码图标 (安卓自适应图标)
            src: 'https://api.dicebear.com/9.x/initials/png?seed=LU&backgroundColor=000000&textColor=00ffcc&size=512',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],

        // --- 5. 修复截图 (使用 Unsplash 稳定图床) ---
        screenshots: [
          {
            src: "https://images.unsplash.com/photo-1616531770192-6eaea74c2456?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
            label: "Focus Timer"
          },
          {
            src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
            label: "AI Chat"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
})