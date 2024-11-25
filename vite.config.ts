import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite';

import { createPlugins } from './config/plugins';

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const isBuild = command === 'build';

  const env = loadEnv(mode, root) as Record<keyof ImportMetaEnv, string>;

  const plugins = createPlugins({
    isBuild,
    isUseSWC: Boolean(env.VITE_APP_USE_SWC),
    enableAnalyze: Boolean(env.VITE_APP_ENABLE_ANALYZE),
    enableMock: Boolean(env.VITE_APP_USE_MOCK),
  });

  return {
    base: './',
    build: {
      // minify: 'terser',
      rollupOptions: {
        output: {
          // Static resource classification and packaging
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            react: ['react', 'react-dom', 'react-redux', 'react-router-dom'],
            arco: ['@arco-design/web-react', '@arco-plugins/vite-react'],
          },
        },
      },
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
    // global css
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'primary-5': '#3247af',
            'primary-6': '#263790',
          },
          javascriptEnabled: true,
          // additionalData: `@import "@/styles/var.less";`,
        },
      },
    },
    optimizeDeps: {
      include: ['@yi-ling/monitor-sdk'],
    },
    // server config
    server: {
      host: '0.0.0.0',
      port: +env.VITE_APP_PORT,
      // open: env.VITE_APP_OPEN_BROWSER,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
    plugins,
  };
});
