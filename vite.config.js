import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'], // 确保包含你的本地图标
      manifest: {
        // --- 1. 基础信息 ---
        name: 'Level Up! 考研助手',
        short_name: 'LevelUp',
        description: 'Gamified Study Timer for Post-grad Entrance Exam',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        
        // --- 2. 关键修复：ID 和 方向 ---
        id: '/', 
        start_url: '/',
        orientation: 'portrait',
        
        // --- 3. 关键修复：图标 (指向你 public 文件夹里的 icon.png) ---
        icons: [
          {
            src: '/icon.png', // 这里改成了本地路径
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon.png', // 这里改成了本地路径
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],

        // --- 4. 截图 (保留网络图以通过测试，以后你可以换成自己的) ---
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
      }
    })
  ],
})