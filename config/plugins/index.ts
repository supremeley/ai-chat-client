import { vitePluginForArco } from '@arco-plugins/vite-react';
import reactByBabel from '@vitejs/plugin-react';
import reactBySWC from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import type { PluginOption } from 'vite';
import { ViteAliases } from 'vite-aliases';
import compressPlugin from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';
import Pages from 'vite-plugin-pages';
import topLevelAwait from 'vite-plugin-top-level-await';

interface Options {
  isBuild: boolean;
  // root: string;
  isUseSWC: boolean;
  enableMock?: boolean;
  compress?: string;
  enableAnalyze?: boolean;
}

export const createPlugins = ({ isUseSWC, isBuild, enableAnalyze }: Options): PluginOption[] => {
  const plugins: (PluginOption | PluginOption[])[] = [
    UnoCSS({ configFile: './uni.config.ts' }),
    isUseSWC ? reactBySWC() : reactByBabel(),
    ViteAliases({
      prefix: '@',
      // deep: true,
      // depth: 4,
    }) as PluginOption,
    vitePluginForArco({
      style: true,
      // TODO:
      // modifyVars: {
      //   'primary-6': 'red',
      // },
    }),
    AutoImport({
      imports: ['react', 'react-router-dom', { classnames: [['default', 'classNames']] }],
      dts: './types/auto-import.d.ts',
      eslintrc: {
        enabled: true, // Default `false`
        filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
    }) as PluginOption,
    Pages({
      dirs: ['src/views'],
      importMode: 'async',
    }),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`,
    }),
  ];

  if (isBuild) {
    plugins.push(
      compressPlugin({
        threshold: 10240,
      }),
      viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 20,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
            },
            {
              name: 'removeEmptyAttrs',
              active: false,
            },
          ],
        },
      }) as PluginOption,
    );
  }

  if (enableAnalyze) {
    plugins.push(
      visualizer({
        filename: './node_modules/.cache/visualizer/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    );
  }

  return plugins;
};
