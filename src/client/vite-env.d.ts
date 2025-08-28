/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_USE_HOSTED_LINK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
