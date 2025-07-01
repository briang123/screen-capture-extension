/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly MODE: string;
  // add other env vars as needed
}
declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
