/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />
interface ImportMetaEnv {
    readonly POSTHOG_CLOUD: string
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }