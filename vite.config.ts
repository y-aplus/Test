import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'

// Vitest の型定義をマージするためのインターフェース
interface VitestConfigExport extends UserConfig {
  test?: any; // InlineConfig がエクスポートされていないため any を使用
}

// https://vite.dev/config/
export default defineConfig({
  base: '/Test/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
} as VitestConfigExport)
