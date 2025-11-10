import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    base: '/compressorWeb/', // ✅ Necessário para GitHub Pages
    plugins: [react()],

    build: {
      target: 'esnext',
      cssCodeSplit: true,
      sourcemap: isDev,
      minify: isDev ? false : 'esbuild',
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          // ❌ Removido manualChunks — causa problemas com React
        },
      },
    },

    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react', // ✅ Garante compatibilidade JSX
      legalComments: 'none',
      keepNames: isDev,
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      '__DEV__': JSON.stringify(isDev),
    },

    resolve: {
      alias: {
        '@': '/src',
      },
    },

    // ⚡ Removido optimizeDeps.include — deixamos Vite gerenciar sozinho
    optimizeDeps: {
      exclude: ['lucide-react'],
    },

    server: {
      open: true,
      port: 5173,
      strictPort: true,
    },

    preview: {
      port: 4173,
      open: true,
    },
  }
})
