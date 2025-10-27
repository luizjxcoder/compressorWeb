import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// 🚀 Configuração principal
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  // 🧱 Configurações específicas para DEV e PROD
  const build: UserConfig['build'] = isDev
    ? {
        minify: false,
        rollupOptions: { output: { manualChunks: undefined } },
        sourcemap: true, // Facilita debug no navegador
      }
    : {
        target: 'esnext', // Moderniza o bundle para browsers recentes
        cssCodeSplit: true, // Divide CSS por componente/página
        sourcemap: false, // Desativa mapas de origem para performance
        minify: 'esbuild', // Compressão mais rápida e eficiente
        chunkSizeWarningLimit: 800, // Evita alertas falsos de bundle grande
        rollupOptions: {
          output: {
            // Cria divisão inteligente de bundles para caching e performance
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('react')) return 'vendor-react'
                if (id.includes('lucide-react')) return 'vendor-icons'
                return 'vendor'
              }
            },
          },
        },
      }

  // ⚡ Configuração do esbuild
  const esbuild: UserConfig['esbuild'] = isDev
    ? {
        jsxDev: true,
        keepNames: true,
        minifyIdentifiers: false,
      }
    : {
        jsx: 'automatic',
        legalComments: 'none', // Remove comentários de licenças no build
      }

  // 🌍 Variáveis globais
  const define: UserConfig['define'] = {
    'process.env.NODE_ENV': JSON.stringify(mode),
    '__DEV__': JSON.stringify(isDev),
  }

  return {
    base: isDev ? '/' : '/compressorWeb/', // alterna automaticamente
    plugins: [react()],
    build,
    esbuild,
    define,
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['lucide-react'], // Evita conflito no pré-bundle
    },
    server: {
      open: true, // Abre o navegador automaticamente em dev
      port: 5173,
      strictPort: true, // Evita mudar porta automaticamente
    },
    preview: {
      port: 4173,
      open: true,
    },
  }
})
