/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client-react" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_PORT: number;
  readonly VITE_APP_PUBLIC_PATH: string;
  readonly VITE_APP_OPEN_BROWSER: string;
  readonly VITE_APP_GLOBAL_API_URL: string;
  readonly VITE_APP_GLOBAL_UPLOAD_URL: string;
  readonly VITE_APP_GLOBAL_API_URL_PREFIX: string;
  readonly VITE_APP_USE_MOCK: boolean;
  readonly VITE_APP_USE_SWC: boolean;
  readonly VITE_APP_ENABLE_ANALYZE: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
