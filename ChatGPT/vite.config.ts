import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import commonjs from 'vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react(),commonjs()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: ['es2021', 'chrome100', 'safari13'],
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      output: {
        manualChunks: {
          ant: ['antd'],
          antico: ['@ant-design/icons'],
          editor: ['@monaco-editor/react'],
          utils: ['lodash', 'uuid', 'dayjs', 'clsx'],
          rrr: ['react', 'react-dom', 'react-router-dom'],
          rm: ['react-markdown'],
          rsh: ['react-syntax-highlighter'],
          md: ['github-markdown-css', 'rehype-raw', 'remark-comment-config', 'remark-gfm'],
        },
      },
    },
  },
});
