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
        // 1. 基础信息
        name: 'Level Up! 考研助手',
        short_name: 'LevelUp',
        description: 'Gamified Study Timer for Post-grad Entrance Exam',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        
        // 2. 修复 Orientation 和 ID 警告
        orientation: 'portrait', // 强制竖屏
        id: '/', // 固定的应用 ID
        start_url: '/',
        scope: '/',
        
        // 3. 修复 Categories 警告
        categories: ['productivity', 'education', 'utilities'],
        
        // 4. 修复 Icons (使用更稳定的在线资源，确保尺寸和类型完美匹配)
        icons: [
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/192px-React-icon.svg.png', // 临时借用 React 图标，稳定
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/192px-React-icon.svg.png', 
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable' // 安卓需要 maskable 图标
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        
        // 5. 修复 Screenshots 警告 (必须是宽屏/竖屏图片，使用占位符)
        screenshots: [
          {
            src: "https://placehold.co/1080x1920/111/FFF/png?text=LevelUp+Timer",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
            label: "Focus Mode"
          },
          {
            src: "https://placehold.co/1080x1920/222/FFF/png?text=AI+Coach",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
            label: "AI Chat"
          }
        ],

        // 6. 修复 Shortcuts 警告 (添加快捷方式)
        shortcuts: [
          {
            name: "开始专注",
            short_name: "专注",
            description: "立即进入专注模式",
            url: "/",
            icons: [{ src: "https://placehold.co/192x192/png", sizes: "192x192" }]
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