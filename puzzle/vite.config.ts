import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'static/dist',
    rollupOptions: {
      input: 'src/render.ts', // 메인 파일
      output: {
        entryFileNames: `[name].js`, // 해시값 제거 (render.js로 고정)
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
});