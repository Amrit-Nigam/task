/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Pokédex API. Empty in development: Vite proxies /api. */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
